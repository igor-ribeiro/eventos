import { downloadFile, generateCsv } from "@/utils/export";
import { trpc } from "@/utils/trpc";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useReducer, useRef } from "react";
import { ClearIcon, DownloadIcon } from "@/components/Icons";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { ssp } from "@common/server/ssp";
import { DeleteIcon } from "@common/components/Icons";

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
      .then(() => alert("Convidado removido"))
      .catch(() => alert("Erro ao remover convidado. Tente novamente"));
  }

  function onExportEvent() {
    downloadFile(JSON.stringify(event.data), `event-${router.query.slug}.json`);
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

      <h3>Convidados</h3>
      <div className="overflow-x-auto">
        <form className="mx-auto" onChange={onChange} action="" ref={formRef}>
          <input type="hidden" name="event_id" value={event.data.id} />
          <table className="table w-full">
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

export default GuestListPage;
