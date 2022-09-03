import { downloadFile } from "@/utils/export";
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

  // trpc.useQuery(["event.user.getAllByUser"]);

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

  // @ts-ignore
  const guests = event.data.guests.filter((guest) => {
    const hasName = true;
    const hasAge = true;
    const hasConfirmation = true;
    // const hasName = new RegExp(removeAccents(filter.name), "i").test(
    //   removeAccents(guest.name)
    // );
    // const hasAge = guest.age === filter.age;
    // const hasConfirmation = guest.confirmation === filter.confirmation;

    if (filter.name && !hasName) {
      return false;
    }

    if (filter.age && !hasAge) {
      return false;
    }

    if (filter.confirmation && !hasConfirmation) {
      return false;
    }

    return true;
  });

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
    return;
    // downloadFile(
    //   generateCsv(
    //     [
    //       { name: "name", label: "Nome" },
    //       { name: "age", label: "Idade", format: renderAge },
    //       {
    //         name: "confirmation",
    //         label: "Confirmação",
    //         format: renderConfirmation,
    //       },
    //     ],
    //     guests
    //   ),
    //   `convidados-${router.query.slug}.csv`
    // );
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

      <div className="border border-base-300 rounded-md overflow-x-auto mt-6">
        <form className="mx-auto" onChange={onChange} action="" ref={formRef}>
          <input type="hidden" name="event_id" value={event.data.id} />
          <table className="table w-full table-compact m-0">
            <thead>
              <tr>
                <th className="w-[64px]">
                  <br />
                  {/** @ts-ignore */}
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
                {guests[0]?.fields.map(({ id, field }) => {
                  return <th key={id}>{field.name}</th>;
                })}
                {/*
                <th>
                  <div className="form-control">
                    <label htmlFor="name">Nome</label>
                    <input
                      name="name"
                      type="text"
                      className="input input-bordered input-sm w-full"
                      autoFocus
                    />
                  </div>
                </th>
                <th>
                  <div className="form-control">
                    <label htmlFor="age">Idade</label>
                    <select
                      name="age"
                      className="select select-bordered w-full select-sm"
                    >
                      <option value="">Todos</option>
                      <option>Adulto</option>
                      <option>De 5 a 12 anos</option>
                      <option>Menor que 5 anos</option>
                    </select>
                  </div>
                </th>
                <th>
                  <div className="form-control">
                    <label htmlFor="confirmation">Confirmado</label>
                    <select
                      name="confirmation"
                      className="select select-bordered w-full select-sm"
                    >
                      <option value="">Todos</option>
                      <option value={GuestConfirmation.YES}>Sim</option>
                      <option value={GuestConfirmation.MAYBE}>Talvez</option>
                      <option value={GuestConfirmation.NO}>Não</option>
                    </select>
                  </div>
                </th>
                */}
                <th className="align-top w-[30px]">
                  <br />
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={onExportGuestList}
                  >
                    <DownloadIcon />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {/** @ts-ignore */}
              {guests.map((guest, i) => (
                <tr key={guest.id} className={i % 2 === 0 ? "" : "active"}>
                  <th>{i + 1}</th>
                  {guest.fields.map(({ id, field, value }) => {
                    return <td key={id}>{value}</td>;
                  })}
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
