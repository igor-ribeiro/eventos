import superjson from "superjson";
import { trpc } from "@/utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/server/router";
import { prisma } from "@/server/db/client";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Link from "next/link";

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

  await Promise.all([
    ssr.fetchQuery("event.getAllByUser"),
    ssr.fetchQuery("auth.getSession"),
  ]);

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
  const user = useRequiredUser();
  const events = trpc.useQuery(["event.getAllByUser"]);

  if (events.data == null) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1 className="mb-2">Eventos</h1>
      <ul>
        {events.data.map((event) => {
          return (
            <li key={event.id}>
              <Link href={`/${event.slug}/lista`}>{event.name}</Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

const useRequiredUser = () => {
  const session = useContext(ProtectedContext);

  if (session == null) {
    throw new Error("Unauthenticated");
  }

  return session!.user;
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
