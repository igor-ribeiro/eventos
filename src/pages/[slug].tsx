import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import { useRouter } from "next/router";
import imageURL from "@/assets/image.jpg";

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

  return (
    <header
      className="hero bg-base-200 min-h-[250px] bg-center"
      style={{
        backgroundImage: `url(${imageURL.src})`,
      }}
    >
      <div className="hero-overlay bg-opacity-50"></div>
      <div className="hero-content text-center text-white">
        <div className="max-w-md">
          <h1 className="font-bold text-3xl md:text-5xl mb-6">{data.name}</h1>
          <p>{data.description}</p>
        </div>
      </div>
    </header>
  );
};

export default EventPage;
