import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { getSSP } from "@/server/get-ssp";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { EventsTable } from "@/components/EventsTable";

export const getServerSideProps: GetServerSideProps = (ctx) => {
  return getSSP(ctx, (ssr) => ssr.fetchQuery("event.user.getAllByUser"));
};

const Home: NextPage = () => {
  return (
    <ProtectedPage>
      <Head>
        <title>Meus Eventos</title>
      </Head>

      <div className="w-content">
        <EventsTable />
      </div>
    </ProtectedPage>
  );
};

export default Home;
