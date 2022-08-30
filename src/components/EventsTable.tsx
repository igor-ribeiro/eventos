import { trpc } from "@/utils/trpc";
import { AddIcon } from "@common/components/Icons";
import Link from "next/link";

export const EventsTable = () => {
  const events = trpc.useQuery(["event.user.getAllByUser"]);

  if (events.data == null) {
    return null;
  }

  return (
    <>
      <h1 className="text-xl leading-normal font-extrabold flex gap-6">
        Eventos
        <Link href="/events/create">
          <a className="btn btn-outline btn-sm gap-2">
            <AddIcon /> criar
          </a>
        </Link>
      </h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full border border-base-300">
          <thead>
            <tr>
              <th className="w-[56px]"></th>
              <th>Nome</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {events.data.map((event, i) => {
              return (
                <tr key={event.id}>
                  <th>{i + 1}</th>
                  <td>
                    <Link href={`/${event.link}/convidados`}>{event.name}</Link>
                  </td>
                  <td>{event.date.toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
