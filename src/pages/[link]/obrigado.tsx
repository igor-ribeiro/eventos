import { Hero } from "@/components/Hero";
import { trpc } from "@/utils/trpc";
import { ssp } from "@common/server/ssp";
import format from "date-fns/format";
import { GetServerSidePropsContext, NextPage, NextPageContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import locale from "date-fns/locale/pt-BR";

export const getServerSideProps = (ctx: GetServerSidePropsContext) =>
  ssp(ctx, async (ssr) => {
    return ssr.fetchQuery("event.public.getByLink", {
      link: ctx.query.link as string,
    });
  });

const ThankYouPage: NextPage = () => {
  const router = useRouter();

  const event = trpc.useQuery([
    "event.public.getByLink",
    {
      link: router.query.link as string,
    },
  ]);

  if (event.data == null) {
    return null;
  }

  return (
    <Hero image={event.data.imageUrl} fullScreen>
      <Head>
        <title>Obrigado - {event.data.name}</title>
        <meta name="description" content={event.data.description} />
      </Head>

      <h1 className="text-white md:text-5xl mb-4 uppercase text-center">
        Obrigado pela confirmação
      </h1>
      <p className="mb-4 font-bold text-1md">
        Te esperamos dia{" "}
        {format(event.data.date, "dd 'de' MMMM", {
          locale,
        })}
      </p>
    </Hero>
  );
};

export default ThankYouPage;
