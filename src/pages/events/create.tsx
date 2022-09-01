import { getCategoryText, getTypeText } from "@/utils/field";
import { trpc } from "@/utils/trpc";
import { DeleteIcon } from "@common/components/Icons";
import { Input } from "@common/components/Input";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { addToast } from "@common/components/Toast";
import { ssp } from "@common/server/ssp";
import { Field, FieldCategory } from "@prisma/client";
import { dispatchCustomEvent } from "@ribeirolabs/events";
import { useEvent } from "@ribeirolabs/events/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

export const getServerSideProps: GetServerSideProps = (ctx) => {
  return ssp(ctx, (ssr) => [ssr.prefetchQuery("field.getAll")]);
};

export default function CreateCompanyPage() {
  const router = useRouter();
  const create = trpc.useMutation("event.create");

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [fields, setFields] = useState<Field[]>([]);

  const origin = useMemo(() => {
    if (typeof window === "undefined") {
      return "/";
    }

    return window.location.origin;
  }, []);

  useEffect(() => {
    setLink(name.toLowerCase().replace(/\s/g, "-"));
  }, [name]);

  function removeField(id: string) {
    setFields((fields) => fields.filter((field) => field.id !== id));
  }

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);

    create
      .mutateAsync({
        name: data.get("name") as string,
        link: data.get("link") as string,
        description: data.get("description") as string,
        date: new Date(data.get("date") as string),
        confirmationDeadline: new Date(
          data.get("confirmation_deadline") as string
        ),
        fields: fields.map((field) => field.id),
      })
      .then((event) => {
        addToast(`Event ${event.name} criado`, "success");
      })
      .catch(() => {
        addToast("Não foi possível criar o evento", "error");
      });
  }

  return (
    <ProtectedPage>
      <Head>
        <title>Criar Evento / RibeiroLabs</title>
      </Head>

      <div className="w-content">
        <form className="form max-w-lg mx-auto" onSubmit={onCreate}>
          <h2 className="mt-0">Informações do Evento</h2>

          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
            autoComplete="off"
          />

          <Input
            label="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            helper={origin + "/" + (link ?? "")}
            name="link"
            autoComplete="off"
          />

          <Input
            label="Descrição"
            type="textarea"
            name="description"
            autoComplete="off"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" name="date" />

            <Input
              label="Confirmar até"
              type="date"
              name="confirmation_deadline"
            />
          </div>

          <div className="divider"></div>

          <h2 className="mt-0">Informações dos Convidados</h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full border border-base-300 table-compact">
              <thead>
                <tr>
                  <th className="w-[56px]"></th>
                  <th>Nome</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => {
                  return (
                    <tr key={field.id}>
                      <th>{i + 1}</th>
                      <td>{field.name}</td>
                      <td>
                        <span className="badge badge-secondary badge-sm font-bold uppercase mx-2">
                          {getTypeText(field.type)}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-action"
                          onClick={() => removeField(field.id)}
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td colSpan={4}>
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={() =>
                        dispatchCustomEvent("modal", {
                          id: "select-field-modal",
                          action: "open",
                        })
                      }
                    >
                      Adicionar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="divider"></div>

          <div className="flex justify-between">
            <button className="btn btn-primary" type="submit">
              Criar
            </button>
            <Link href="/">
              <a className="btn btn-ghost">Cancelar</a>
            </Link>
          </div>
        </form>
      </div>

      <FieldModal onSelect={(fields) => setFields(fields)} />
    </ProtectedPage>
  );
}

const FieldModal = ({ onSelect }: { onSelect: (fields: Field[]) => void }) => {
  const fields = trpc.useQuery(["field.getAll"]);
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<Field[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    Partial<Record<FieldCategory, boolean>>
  >({});

  useEvent(
    "modal",
    useCallback((e) => {
      if (e.detail.id !== "select-field-modal") {
        return;
      }

      setOpened(e.detail.action === "open");
    }, [])
  );

  function onConfirm() {
    if (selected.length === 0) {
      addToast("Selecione ao menos uma informação", "error");
      return;
    }

    onSelect(selected);
    setOpened(false);
  }

  return (
    <div className="modal modal-bottom sm:modal-middle" data-open={opened}>
      <div className="modal-box border border-base-300 md:max-w-4xl">
        <h3 className="font-bold text-lg">Informações dos Convidados</h3>

        <div className="overflow-x-auto">
          <table className="table w-full border border-base-300 table-compact">
            <thead>
              <tr>
                <th className="w-[10ch]">Escolher</th>
                <th>Nome</th>
                <th className="w-[10ch]">Tipo</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {fields.data?.map((field, i) => {
                const Container = field.options.length > 0 ? "details" : "div";

                const isDisabled =
                  selectedCategories[field.category] &&
                  !selected.includes(field);

                return (
                  <tr
                    key={field.id}
                    className="align-top"
                    data-cat={field.category}
                  >
                    <th className="text-center">
                      <input
                        type="checkbox"
                        className="toggle"
                        disabled={isDisabled}
                        checked={selected.includes(field)}
                        title={
                          isDisabled
                            ? `Você já selecionou um campo de ${getCategoryText(
                                field.category
                              )}`
                            : ""
                        }
                        onChange={(e) => {
                          const isSelected = e.target.checked;

                          setSelected((selected) => {
                            if (isSelected) {
                              return selected.concat(field);
                            }

                            return selected.filter((id) => id !== field);
                          });
                          setSelectedCategories((categories) => {
                            return {
                              ...categories,
                              [field.category]: isSelected,
                            };
                          });
                        }}
                      />
                    </th>
                    <td>
                      <Container>
                        <summary className="font-bold">{field.name}</summary>
                        {field.options?.map((option) => (
                          <ul key={option.id} className="active text-xs">
                            <li>
                              {option.name} - {option.description}
                            </li>
                          </ul>
                        ))}
                      </Container>
                    </td>
                    <td>
                      <span className="badge badge-secondary badge-sm font-bold uppercase">
                        {getTypeText(field.type)}
                      </span>
                    </td>
                    <td>{field.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => setOpened(false)}>
            Cancelar
          </button>
          <button className="btn" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
