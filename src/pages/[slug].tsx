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

  return (
    <div>
      <header
        className="hero bg-base-200 min-h-[250px] bg-center"
        style={{
          backgroundImage: data.imageUrl ? `url(${data.imageUrl})` : undefined,
        }}
      >
        <div className="hero-overlay bg-opacity-50"></div>
        <div className="hero-content text-center text-white">
          <div className="max-w-md">
            <h1 className="font-bold text-3xl md:text-5xl mb-6">{data.name}</h1>
            <p className="mb-6">{data.description}</p>
            <p className="font-bold">Confirme sua presença abaixo</p>
          </div>
        </div>
      </header>

      <main className="p-2">
        <div className="form-control mb-4">
          <label className="label font-bold" htmlFor="name">
            Nome e Sobrenome
          </label>
          <input
            name="name"
            type="text"
            className="input input-bordered w-full"
            autoFocus
          />
        </div>

        <div className="form-control mb-4">
          <label className="label font-bold" htmlFor="age">
            Idade
          </label>
          <select name="age" className="select select-bordered w-full">
            <option selected>Adulto</option>
            <option>De 5 a 12 anos</option>
            <option>Menor que 5 anos</option>
          </select>
        </div>

        <div className="form-control mb-4">
          <label className="label font-bold" htmlFor="confirmation">
            Presença
          </label>
          <select name="confirmation" className="select select-bordered w-full">
            <option selected>Sim</option>
            <option>Talvez</option>
            <option>Não</option>
          </select>
        </div>

        <div className="grid gap-2">
          <button className="btn">Próximo Convidado &rarr;</button>
          <button className="btn btn-primary">Finalizar</button>
        </div>
      </main>
    </div>
  );
};

export default EventPage;
