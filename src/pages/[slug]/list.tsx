import { Hero } from "@/components/Hero";
import { downloadCsv, generateCsv } from "@/utils/csv";
import { trpc } from "@/utils/trpc";
import { GuestAge, GuestConfirmation } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useReducer, useRef } from "react";
import removeAccents from "remove-accents";

type Total = Record<
  GuestConfirmation,
  Record<GuestAge, number> & { total: number }
>;

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

const ListPage: NextPage = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const event = trpc.useQuery([
    "event.getListBySlug",
    {
      slug: router.query.slug as string,
    },
  ]);

  const removeGuest = trpc.useMutation(["event.removeGuest"]);

  const [filter, update] = useReducer(filterReducer, INITIAL_FILTER);

  if (event.data == null) {
    return null;
  }

  const guests = event.data.guests.filter((guest) => {
    const hasName = new RegExp(removeAccents(filter.name), "i").test(
      removeAccents(guest.name)
    );

    const hasAge = guest.age === filter.age;
    const hasConfirmation = guest.confirmation === filter.confirmation;

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

  function onExport() {
    downloadCsv(
      generateCsv(
        [
          { name: "name", label: "Nome" },
          { name: "age", label: "Idade", format: renderAge },
          {
            name: "confirmation",
            label: "Confirmação",
            format: renderConfirmation,
          },
        ],
        guests
      ),
      `convidados-${router.query.slug}`
    );
  }

  function onClearFilter() {
    formRef.current!.reset();
    (formRef.current!.name as any as HTMLInputElement).focus();
    update("RESET");
  }

  const total = event.data.guests.reduce(
    (total, guest) => {
      total[guest.confirmation][guest.age] =
        (total[guest.confirmation][guest.age] || 0) + 1;

      if (guest.age === "BABY") {
        return total;
      }

      total[guest.confirmation].total++;

      return total;
    },
    {
      YES: {
        total: 0,
      },
      NO: {
        total: 0,
      },
      MAYBE: {
        total: 0,
      },
    } as Total
  );

  const totalConfirmed = total.YES.total + total.MAYBE.total;

  return (
    <div className="p-4">
      <Head>
        <title>Lista - {event.data.name}</title>
      </Head>

      <h1 className="mb-0 uppercase">{event.data.name}</h1>

      <div className="border border-base-300 rounded-md mt-4">
        <table className="table w-full table-compact m-0">
          <thead>
            <tr>
              <th colSpan={2} className="text-center">
                Total
              </th>
              <th colSpan={3} className="text-center">
                Idade
              </th>
            </tr>
            <tr>
              <th className="font-bold">Presença</th>
              <th className="font-bold">{totalConfirmed}</th>
              <th className="font-bold">Adulto</th>
              <th className="font-bold">Criança</th>
              <th className="font-bold">Bebê</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sim</td>
              <td>{total.YES.total}</td>
              <td>{total.YES.ADULT}</td>
              <td>{total.YES.CHILD}</td>
              <td>{total.YES.BABY}</td>
            </tr>
            <tr>
              <td>Talvez</td>
              <td>{total.MAYBE.total}</td>
              <td>{total.MAYBE.ADULT}</td>
              <td>{total.MAYBE.CHILD}</td>
              <td>{total.MAYBE.BABY}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border border-base-300 rounded-md overflow-x-auto mt-6">
        <form className="mx-auto" onChange={onChange} action="" ref={formRef}>
          <input type="hidden" name="event_id" value={event.data.id} />
          <table className="table w-full table-compact m-0">
            <thead>
              <tr>
                <th className="w-[64px]">
                  <br />
                  {guests.length !== event.data.guests.length && (
                    <button
                      className="btn btn-sm "
                      type="button"
                      onClick={onClearFilter}
                    >
                      <ClearIcon />
                    </button>
                  )}
                </th>
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
                      <option value={GuestAge.ADULT}>Adulto</option>
                      <option value={GuestAge.CHILD}>De 5 a 12 anos</option>
                      <option value={GuestAge.BABY}>Menor que 5 anos</option>
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
                <th className="align-top w-[30px]">
                  <br />
                  <button
                    className="btn btn-sm"
                    type="button"
                    onClick={onExport}
                  >
                    <DownloadIcon />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr key={guest.id} className={i % 2 === 0 ? "" : "active"}>
                  <th>{i + 1}</th>
                  <td>{guest.name}</td>
                  <td>{renderAge(guest.age)}</td>
                  <td>{renderConfirmation(guest.confirmation)}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveGuest(guest.id)}
                      disabled={removeGuest.status === "loading"}
                    >
                      <RemoveIcon />
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

const AGE_TEXT: Record<GuestAge, string> = {
  BABY: "Menores de 5 anos",
  CHILD: "De 5 a 12 anos",
  ADULT: "Adulto",
};

function renderAge(age: GuestAge): string {
  return AGE_TEXT[age];
}

const CONFIRMATION_TEXT: Record<GuestConfirmation, string> = {
  YES: "Sim",
  NO: "Não",
  MAYBE: "Talvez",
};

function renderConfirmation(confirmation: GuestConfirmation): string {
  return CONFIRMATION_TEXT[confirmation];
}

function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default ListPage;
