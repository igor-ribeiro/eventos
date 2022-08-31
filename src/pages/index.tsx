import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { EventsTable } from "@/components/EventsTable";
import { ssp } from "@common/server/ssp";

export const getServerSideProps: GetServerSideProps = (ctx) => {
  return ssp(ctx, (ssr) => ssr.fetchQuery("event.getAllByUser"));
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
