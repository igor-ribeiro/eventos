import { formDataToJson } from "@/utils/formData-to-json";
import { inferMutationInput, trpc } from "@/utils/trpc";
import { GuestAge, GuestConfirmation } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef } from "react";

const EventPage: NextPage = () => {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);

  const event = trpc.useQuery([
    "event.getBySlug",
    {
      slug: router.query.slug as string,
    },
  ]);

  const confirmGuest = trpc.useMutation(["event.confirmGuest"]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.persist();
    e.preventDefault();

    // @ts-ignore
    const button = e.nativeEvent.submitter as HTMLButtonElement | undefined;

    const data = formDataToJson<inferMutationInput<"event.confirmGuest">>(
      new FormData(e.target as HTMLFormElement)
    );

    if (button) {
      data[button.name as "action"] = button.value as typeof data.action;
    }

    confirmGuest.mutate(data);
  }

  const shouldResetForm =
    confirmGuest.status === "success" && confirmGuest.data === "next";

  useEffect(() => {
    if (shouldResetForm) {
      formRef.current!.reset();
    }
  }, [shouldResetForm]);

  if (event.data == null) {
    return null;
  }

  return (
    <div>
      <header
        className="hero bg-base-200 min-h-[200px] bg-center"
        style={{
          backgroundImage: event.data.imageUrl
            ? `url(${event.data.imageUrl})`
            : undefined,
        }}
      >
        <div className="hero-overlay bg-opacity-50"></div>
        <div className="hero-content text-center text-white">
          <div className="max-w-md">
            <h1 className="font-bold text-3xl md:text-5xl mb-4">
              {event.data.name}
            </h1>
            <p className="mb-4">{event.data.description}</p>
            <p className="font-bold">Confirme sua presença abaixo</p>
          </div>
        </div>
      </header>

      <form ref={formRef} className="p-2" onSubmit={onSubmit} action="">
        <input type="hidden" name="event_id" value={event.data.id} />

        <div className="form-control mb-4">
          <label className="label font-bold" htmlFor="name">
            Nome e Sobrenome
          </label>
          <input
            name="name"
            type="text"
            className="input input-bordered w-full"
            autoFocus
          />
        </div>

        <div className="form-control mb-4">
          <label className="label font-bold" htmlFor="age">
            Idade
          </label>
          <select
            name="age"
            className="select select-bordered w-full"
            defaultValue={GuestAge.ADULT}
          >
            <option value={GuestAge.ADULT}>Adulto</option>
            <option value={GuestAge.CHILD}>De 5 a 12 anos</option>
            <option value={GuestAge.BABY}>Menor que 5 anos</option>
          </select>
        </div>

        <div className="form-control mb-4">
          <label className="label font-bold" htmlFor="confirmation">
            Confirmar Presença
          </label>
          <select
            name="confirmation"
            className="select select-bordered w-full"
            defaultValue={GuestConfirmation.YES}
          >
            <option value={GuestConfirmation.YES}>Sim</option>
            <option value={GuestConfirmation.MAYBE}>Talvez</option>
            <option value={GuestConfirmation.NO}>Não</option>
          </select>
        </div>

        <div className="grid gap-2">
          <button
            className="btn"
            type="submit"
            name="action"
            value="next"
            disabled={confirmGuest.isLoading}
          >
            Próximo Convidado &rarr;
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            name="action"
            value="finalize"
            disabled={confirmGuest.isLoading}
          >
            Finalizar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventPage;
