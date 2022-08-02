import superjson from "superjson";
import { trpc } from "@/utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/server/router";
import { prisma } from "@/server/db/client";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Link from "next/link";
import { UploadIcon } from "@/components/Icons";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions
  );

  const ssr = createSSGHelpers({
    router: appRouter,
    transformer: superjson,
    ctx: {
      req: undefined,
      res: undefined,
      session: session,
      prisma: prisma,
    },
  });

  try {
    await Promise.all([
      ssr.fetchQuery("event.user.getAllByUser"),
      ssr.fetchQuery("auth.getSession"),
    ]);
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: "/api/auth/signin",
      },
    };
  }

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const Home: NextPage = () => {
  return (
    <Protected>
      <Head>
        <title>Eventos</title>
      </Head>
      <EventsPage />
    </Protected>
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
    <div className="p-4">
      <div className="flex justify-between">
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
    </div>
  );
};

const ProtectedContext = createContext<Session | null>(null);

const Protected = ({ children }: { children: ReactNode }) => {
  const session = trpc.useQuery(["auth.getSession"]);
  const router = useRouter();

  useEffect(() => {
    if (session.data == null && session.status === "success") {
      router.push("/api/auth/signin");
    }
  }, [session, router]);

  if (session.data == null) {
    return <p>Loading...</p>;
  }

  return (
    <ProtectedContext.Provider value={session.data!}>
      {children}
    </ProtectedContext.Provider>
  );
};

export default Home;
