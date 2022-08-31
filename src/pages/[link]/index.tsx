import { Hero } from "@/components/Hero";
import { formDataToJson } from "@/utils/formData-to-json";
import { inferMutationInput, trpc } from "@/utils/trpc";
import { ssp } from "@common/server/ssp";
import { GuestConfirmation } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";

export const getServerSideProps: GetServerSideProps = (ctx) =>
  ssp(ctx, (ssr) => {
    return [
      ssr.fetchQuery("event.public.getByLink", {
        link: ctx.query.link as string,
      }),
    ];
  });

const EventPage: NextPage = () => {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);

  const event = trpc.useQuery([
    "event.public.getByLink",
    {
      link: router.query.link as string,
    },
  ]);

  const confirmGuest = trpc.useMutation(["event.public.confirmGuest"]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // @ts-ignore
    const button = e.nativeEvent.submitter as HTMLButtonElement | undefined;

    const data = new FormData(e.target as HTMLFormElement);

    if (button) {
      data.set("action", button.value);
    }

    const input = {
      fields: [],
    } as any as inferMutationInput<"event.public.confirmGuest">;

    for (const key of Array.from(data.keys())) {
      if (key === "action" || key === "eventId") {
        input[key as keyof typeof input] = data.get(key) as any;
      } else {
        input.fields.push({
          id: key,
          value: data.get(key) as string,
        });
      }
    }

    confirmGuest.mutate(input as Required<typeof input>);
  }

  const shouldResetForm =
    confirmGuest.status === "success" && confirmGuest.data === "next";

  const redirectToThankYou =
    confirmGuest.status === "success" && confirmGuest.data === "finalize";

  useEffect(() => {
    if (shouldResetForm) {
      formRef.current!.reset();
      setFormKey((key) => key + 1);
    }
  }, [shouldResetForm]);

  useEffect(() => {
    if (redirectToThankYou) {
      router.push({
        pathname: "/[link]/obrigado",
        query: {
          link: router.query.slug,
        },
      });
    }
  }, [redirectToThankYou, router]);

  if (event.data == null) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>{event.data.name}</title>
        <meta name="description" content={event.data.description} />
        <meta property="og:title" content={event.data.name} />
        <meta property="og:description" content={event.data.description} />
        {event.data.imageUrl && (
          <meta property="og:image" content={event.data.imageUrl} />
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
        <input type="hidden" name="eventId" value={event.data.id} />

        {event.data.fields.map(({ id, field }, i) => {
          if (["TEXT", "NUMBER"].includes(field.type)) {
            return (
              <div className="form-control mb-4" key={id}>
                <label className="label font-bold" htmlFor={field.id}>
                  {field.name}
                </label>
                <input
                  name={field.id}
                  type={field.type}
                  className="input input-bordered w-full"
                  autoFocus={i === 0}
                />
              </div>
            );
          }

          if (field.type === "OPTION") {
            return (
              <div className="form-control mb-4" key={id}>
                <label className="label font-bold" htmlFor={field.id}>
                  {field.name}
                </label>
                <select
                  name={field.id}
                  className="select select-bordered w-full"
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return null;
        })}

        {/*
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
        */}

        <div className="grid gap-2">
          <button
            className="btn btn"
            type="submit"
            name="action"
            value="next"
            disabled={confirmGuest.isLoading}
          >
            Próximo Convidado
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
