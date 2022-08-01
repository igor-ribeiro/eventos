import { Hero } from "@/components/Hero";
import { trpc } from "@/utils/trpc";
import { GuestAge, GuestConfirmation } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

type Total = Record<
  GuestConfirmation,
  Record<GuestAge, number> & { total: number }
>;

const ListPage: NextPage = () => {
  const router = useRouter();

  const event = trpc.useQuery([
    "event.getListBySlug",
    {
      slug: router.query.slug as string,
    },
  ]);

  if (event.data == null) {
    return null;
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
              <th></th>
              <th>Total</th>
              <th colSpan={2}>Idade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold">Presença</td>
              <td className="font-bold">{totalConfirmed}</td>
              <td className="font-bold">Adulto</td>
              <td className="font-bold">Criança</td>
            </tr>
            <tr>
              <td>Sim</td>
              <td>{total.YES.total}</td>
              <td>{total.YES.ADULT}</td>
              <td>{total.YES.CHILD}</td>
            </tr>
            <tr>
              <td>Talvez</td>
              <td>{total.MAYBE.total}</td>
              <td>{total.MAYBE.ADULT}</td>
              <td>{total.MAYBE.CHILD}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border border-base-300 rounded-md mt-4 overflow-x-auto">
        <table className="table w-full table-compact m-0">
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Idade</th>
              <th>Confirmado</th>
            </tr>
          </thead>
          <tbody>
            {event.data.guests.map((guest, i) => (
              <tr key={guest.id} className={i % 2 === 0 ? "" : "active"}>
                <th>{i + 1}</th>
                <td>{guest.name}</td>
                <td>{renderAge(guest.age)}</td>
                <td>{renderConfirmation(guest.confirmation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default ListPage;
