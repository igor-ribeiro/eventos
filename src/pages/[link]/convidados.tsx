import slugify from "slugify";
import { downloadFile, generateCsv } from "@/utils/export";
import { inferQueryOutput, trpc } from "@/utils/trpc";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { ClearIcon, DownloadIcon } from "@/components/Icons";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { ssp } from "@common/server/ssp";
import { AddIcon, DeleteIcon } from "@common/components/Icons";
import { addToast } from "@common/components/Toast";
import { Field } from "@prisma/client";
import { openModal } from "@common/components/Modal";
import { GuestGroupingModal } from "@/components/GuestGroupingModal";

type Filter = {
  name: string;
  age: string;
  confirmation: string;
};

const INITIAL_FILTER = {
  name: "",
  age: "",
  confirmation: "",
};

function filterReducer(
  state: Filter,
  action: Partial<Filter> | "RESET"
): Filter {
  if (action === "RESET") {
    return INITIAL_FILTER;
  }

  return {
    ...state,
    ...action,
  };
}

export const getServerSideProps: GetServerSideProps = (ctx) => {
  return ssp(ctx, (ssr) =>
    ssr.fetchQuery("event.getListByLink", {
      link: ctx.query.link as string,
    })
  );
};

const GuestListPage: NextPage = () => {
  return (
    <ProtectedPage>
      <ListPage />
    </ProtectedPage>
  );
};

const ListPage: NextPage = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const event = trpc.useQuery([
    "event.getListByLink",
    {
      link: router.query.link as string,
    },
  ]);

  const removeGuest = trpc.useMutation(["event.removeGuest"]);

  const [filter, update] = useReducer(filterReducer, INITIAL_FILTER);

  if (event.data == null) {
    return null;
  }

  const guests = event.data.guests;

  function onChange(e: ChangeEvent<HTMLFormElement>) {
    update({
      [e.target.name]: e.target.value,
    });
  }

  function onRemoveGuest(id: string) {
    removeGuest
      .mutateAsync({ id })
      .then(() => {
        alert("Convidado removido");
        event.refetch();
      })
      .catch(() => alert("Erro ao remover convidado. Tente novamente"));
  }

  function onExportGuestList() {
    if (event.data == null) {
      return;
    }

    const header = event.data.fields.map(({ field }) => {
      return {
        name: field.name,
        label: field.name,
      };
    });

    const data = guests.map((guest) => {
      const values = guest.fields.reduce((values, { field, value }) => {
        values[field.name] = value;

        return values;
      }, {} as Record<string, string>);

      return {
        id: guest.id,
        ...values,
      };
    });

    downloadFile(
      generateCsv(header, data),
      `convidados-${event.data.link}.csv`
    );
  }

  function onClearFilter() {
    formRef.current!.reset();
    (formRef.current!.name as any as HTMLInputElement).focus();
    update("RESET");
  }

  return (
    <div className="w-content">
      <Head>
        <title>Convidados - {event.data.name}</title>
      </Head>

      <div className="flex justify-between">
        <h1 className="mb-0 uppercase">{event.data.name}</h1>
      </div>

      <div className="divider"></div>

      <Grouping event={event.data} />

      <div className="divider"></div>

      <h3>Convidados</h3>

      <div className="overflow-x-auto">
        <form className="mx-auto" onChange={onChange} action="" ref={formRef}>
          <input type="hidden" name="event_id" value={event.data.id} />
          <table className="table">
            <thead>
              <tr>
                <th className="w-[64px]">
                  {guests.length !== event.data.guests.length && (
                    <button
                      className="btn btn-sm btn-ghost"
                      type="button"
                      onClick={onClearFilter}
                    >
                      <ClearIcon />
                    </button>
                  )}
                </th>

                {event.data.fields.map(({ id, field }) => (
                  <th key={id}>{field.name}</th>
                ))}

                <th className="align-top w-[30px]">
                  <button
                    className="btn btn-circle btn-sm"
                    type="button"
                    onClick={onExportGuestList}
                    disabled={guests.length === 0}
                  >
                    <DownloadIcon />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr key={guest.id}>
                  <th>{i + 1}</th>

                  {guest.fields.map(({ id, value }) => (
                    <td key={id}>{value}</td>
                  ))}

                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-action"
                      onClick={() => onRemoveGuest(guest.id)}
                      disabled={removeGuest.status === "loading"}
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

function Grouping({
  event,
}: {
  event: inferQueryOutput<"event.getListByLink">;
}) {
  const [grouping, setGrouping] = useState<{
    field: string;
    values: [string, number][];
  } | null>(null);

  const sum = useMemo(
    () => grouping?.values.reduce((sum, values) => sum + values[1], 0) ?? 0,
    [grouping]
  );

  const onConfirm = useCallback((grouping: any) => {
    setGrouping(grouping);
  }, []);

  function onExport() {
    if (grouping == null) {
      return;
    }

    const header = [grouping.field, "Soma"].map((label) => ({
      label,
      name: label,
    }));

    const data = grouping.values
      .map(([value, sum]) => ({
        [grouping.field]: value,
        Soma: sum,
      }))
      .concat({
        [grouping.field]: "Total",
        Soma: sum,
      });

    downloadFile(
      generateCsv(header, data),
      `${event.link}_convidados-agrupados_${slugify(grouping.field)}.csv`
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <h3>Agrupamento</h3>
        <button
          className="btn btn-sm flex gap-2"
          onClick={() => openModal("guest-grouping-modal")}
        >
          <AddIcon />
          Novo
        </button>
      </div>

      {grouping ? (
        <table className="table mt-4 max-w-sm">
          <thead>
            <tr>
              <th>{grouping.field}</th>
              <th className="text-end">Soma</th>
              <th className="w-[30px]">
                <button
                  className="btn btn-circle btn-sm"
                  type="button"
                  onClick={onExport}
                >
                  <DownloadIcon />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {grouping.values.map(([name, count]) => (
              <tr key={name}>
                <td>{name}</td>
                <td className="text-end">{count}</td>
                <td></td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="bg-neutral">Total</td>
              <td className="bg-neutral text-end">{sum}</td>
              <td className="bg-neutral"></td>
            </tr>
          </tbody>
        </table>
      ) : null}

      <GuestGroupingModal event={event} onConfirm={onConfirm} />
    </>
  );
}

export default GuestListPage;
