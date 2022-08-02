import { Hero } from "@/components/Hero";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const ThankYouPage: NextPage = () => {
  const router = useRouter();

  const event = trpc.useQuery([
    "event.public.getBySlug",
    {
      slug: router.query.slug as string,
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

      <h1 className="text-white md:text-5xl mb-4 uppercase">
        Obrigado pela confirmação 🥳
      </h1>
      <p className="mb-4 font-bold text-1md">
        Esperamos você dia 14 de Agosto ❤️
      </p>
    </Hero>
  );
};

export default ThankYouPage;
