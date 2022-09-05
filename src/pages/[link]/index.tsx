import locale from "date-fns/locale/pt-BR";
import { Hero } from "@/components/Hero";
import { MinimalHeader } from "@/components/MinimalHeader";
import { fillDateTime } from "@/utils/date";
import { inferMutationInput, trpc } from "@/utils/trpc";
import { ShareIcon } from "@common/components/Icons";
import { ssp } from "@common/server/ssp";
import format from "date-fns/format";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useRef, useState } from "react";
import { shareEvent } from "@/utils/event";
import { EventHeroDates } from "@/components/EventHero";

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

  const [confirmedOne, setConfirmedOne] = useState(false);

  const event = trpc.useQuery([
    "event.public.getByLink",
    {
      link: router.query.link as string,
    },
  ]);

  const confirmGuest = trpc.useMutation(["event.public.confirmGuest"]);

  function redirectToThankYou() {
    router.push({
      pathname: "/[link]/obrigado",
      query: {
        link: router.query.link,
      },
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // @ts-ignore
    const button = e.nativeEvent.submitter as HTMLButtonElement | undefined;

    const form = e.target as HTMLFormElement;

    const data = new FormData(form);

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

    if (
      input.action === "finalize" &&
      input.fields.filter((field) => Boolean(field.value)).length <
        input.fields.length &&
      confirmedOne
    ) {
      redirectToThankYou();

      return;
    }

    await confirmGuest.mutateAsync(input as Required<typeof input>);

    setConfirmedOne(true);

    if (input.action === "next") {
      form.reset();
      (form.elements[0]! as HTMLInputElement).focus();
    } else {
      redirectToThankYou();
    }
  }

  const description = useMemo(() => {
    if (!event.data) {
      return;
    }

    return `${event.data.description} / Dia ${format(
      fillDateTime(event.data.date.toISOString()),
      "dd 'de' MMMM",
      {
        locale,
      }
    )}`;
  }, [event.data]);

  if (event.data == null) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>{event.data.name}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={event.data.name} />
        <meta property="og:description" content={description} />
        {event.data.imageUrl && (
          <meta property="og:image" content={event.data.imageUrl} />
        )}
      </Head>

      <Hero image={event.data.imageUrl} position="end">
        <MinimalHeader>
          <button
            className="btn btn-circle btn-ghost"
            onClick={() => shareEvent(event.data!)}
          >
            <ShareIcon />
          </button>
        </MinimalHeader>

        <h1 className="text-white md:text-5xl mb-4 uppercase">
          {event.data.name}
        </h1>
        <p className="mb-4 font-bold text-1md leading-5">
          {event.data.description}
        </p>

        <EventHeroDates
          date={event.data.date}
          confirmationDeadline={event.data.confirmationDeadline}
        />
      </Hero>

      <form
        key={"form-" + formKey}
        data-key={"form-" + formKey}
        ref={formRef}
        className="w-content w-content-sm p-3"
        onSubmit={onSubmit}
        action=""
      >
        <input type="hidden" name="eventId" value={event.data.id} />

        {event.data.fields.map(({ id, field }) => {
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
                  required
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
                  required
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.description ?? option.name}
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

        <div className="flex gap-2 items-center">
          <button
            className="btn flex-1"
            type="submit"
            name="action"
            value="next"
            disabled={confirmGuest.isLoading}
          >
            Próximo
          </button>
          <div className="divider divider-horizontal">ou</div>
          <button
            className="btn btn-primary flex-1"
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
