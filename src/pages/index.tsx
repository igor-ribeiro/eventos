import { trpc } from "@/utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  createContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { Session } from "next-auth";
import Link from "next/link";
import { UploadIcon } from "@/components/Icons";
import { getSSP } from "@/server/get-ssp";
import { ProtectedPage } from "@common/components/ProtectedPage";

export const getServerSideProps: GetServerSideProps = (ctx) => {
  return getSSP(ctx, (ssr) => ssr.fetchQuery("event.user.getAllByUser"));
};

const Home: NextPage = () => {
  return (
    <ProtectedPage>
      <EventsPage />
    </ProtectedPage>
  );
};

const EventsPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const events = trpc.useQuery(["event.user.getAllByUser"]);
  const importEvent = trpc.useMutation(["event.user.importEvent"]);

  function onTriggerImportEvent() {
    inputRef.current!.click();
  }

  async function onImportEvent(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      alert("Selecione 1 arquivo .json");

      return;
    }

    const data = await file.text();

    try {
      const event = await importEvent.mutateAsync({ data });

      router.push(`/${event.slug}/convidados`);
    } catch (e) {
      console.log(e);
      alert("Erro ao importar o evento");
    }
  }

  if (events.data == null) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>Meus Eventos</title>
      </Head>

      <div className="w-content">
        <h1 className="mb-2">Meus Eventos</h1>

        <input
          ref={inputRef}
          onChange={onImportEvent}
          type="file"
          accept="application/json"
          name="file"
          style={{
            display: "none",
          }}
        />

        <button
          className="btn"
          onClick={onTriggerImportEvent}
          title="Importar Evento"
        >
          <UploadIcon />
        </button>
      </div>

      <ul>
        {events.data.map((event) => {
          return (
            <li key={event.id}>
              <Link href={`/${event.slug}/convidados`}>{event.name}</Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Home;
