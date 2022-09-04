import { shareEvent } from "@/utils/event";
import { trpc } from "@/utils/trpc";
import {
  AddIcon,
  DeleteIcon,
  OpenExternalIcon,
  ShareIcon,
} from "@common/components/Icons";
import { addToast } from "@common/components/Toast";
import { Event } from "@prisma/client";
import Link from "next/link";

export const EventsTable = () => {
  const events = trpc.useQuery(["event.getAllByUser"]);
  const deleteEvent = trpc.useMutation("event.delete");

  if (events.data == null) {
    return null;
  }

  function onShare(event: Event) {
    shareEvent(event);
  }

  return (
    <>
      <h1 className="text-xl leading-normal font-extrabold flex gap-6">
        Eventos
        <Link href="/criar">
          <a className="btn btn-secondary btn-sm gap-2">
            <AddIcon />
            criar
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
              <th></th>
            </tr>
          </thead>

          <tbody>
            {events.data.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  Você ainda não possui eventos.{" "}
                  <Link href="/criar">Criar</Link>
                </td>
              </tr>
            ) : (
              events.data.map((event, i) => {
                return (
                  <tr key={event.id}>
                    <th>{i + 1}</th>
                    <td>
                      <Link href={`/${event.link}/convidados`}>
                        {event.name}
                      </Link>
                    </td>
                    <td>{event.date.toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-action"
                        onClick={() => onShare(event)}
                      >
                        <ShareIcon />
                      </button>

                      <Link href={`/${event.link}`}>
                        <a className="btn btn-action">
                          <OpenExternalIcon />
                        </a>
                      </Link>

                      <button
                        className="btn btn-action"
                        onClick={() => {
                          deleteEvent
                            .mutateAsync({ id: event.id })
                            .then((old) => {
                              addToast(
                                `Evento "${old.name}" removido`,
                                "success"
                              );
                              events.refetch();
                            })
                            .catch(() =>
                              addToast(
                                "Não foi possível remover o evento",
                                "error"
                              )
                            );
                        }}
                        data-loading={deleteEvent.isLoading}
                      >
                        {deleteEvent.isLoading ? null : <DeleteIcon />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
