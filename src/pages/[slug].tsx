import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import { useRouter } from "next/router";

const EventPage: NextPage = () => {
  const router = useRouter();

  const { data } = trpc.useQuery([
    "event.getBySlug",
    {
      slug: router.query.slug as string,
    },
  ]);

  if (data == null) {
    return null;
  }

  return <h1 className="font-bold text-xl">Evento: {data.name}</h1>;
};

export default EventPage;
