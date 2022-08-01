import { Hero } from "@/components/Hero";
import { formDataToJson } from "@/utils/formData-to-json";
import { inferMutationInput, trpc } from "@/utils/trpc";
import { GuestAge, GuestConfirmation } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";

const EventPage: NextPage = () => {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);

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

  const redirectToThankYou =
    confirmGuest.status === "success" && confirmGuest.data === "finalize";

  console.log({ shouldResetForm, formKey });

  useEffect(() => {
    if (shouldResetForm) {
      formRef.current!.reset();
      setFormKey((key) => key + 1);
    }
  }, [shouldResetForm]);

  useEffect(() => {
    if (redirectToThankYou) {
      router.push({
        pathname: "/[slug]/obrigado",
        query: {
          slug: router.query.slug,
        },
      });
    }
  }, [redirectToThankYou]);

  if (event.data == null) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>{event.data.name}</title>
        <meta name="description" content={event.data.description} />
        <meta name="og:title" content={event.data.name} />
        <meta name="og:description" content={event.data.description} />
        {event.data.imageUrl && (
          <meta name="og:image" content={event.data.imageUrl} />
        )}
      </Head>

      <Hero image={event.data.imageUrl} position="end">
        <h1 className="text-white md:text-5xl mb-4 uppercase">
          {event.data.name}
        </h1>
        <p className="mb-4 font-bold text-1md leading-5">
          {event.data.description}
        </p>
        <p className="mb-4 font-bold font-sm leading-5">
          Confirme sua presença abaixo
        </p>
      </Hero>

      <form
        key={"form-" + formKey}
        data-key={"form-" + formKey}
        ref={formRef}
        className="max-w-[600px] mx-auto p-3"
        onSubmit={onSubmit}
        action=""
      >
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
