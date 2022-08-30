import { trpc } from "@/utils/trpc";
import { DeleteIcon } from "@common/components/Icons";
import { Input } from "@common/components/Input";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { addToast } from "@common/components/Toast";
import { ssp } from "@common/server/ssp";
import { Field } from "@prisma/client";
import { dispatchCustomEvent } from "@ribeirolabs/events";
import { useEvent } from "@ribeirolabs/events/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useCallback, useMemo, useState } from "react";

export const getServerSideProps: GetServerSideProps = (ctx) => {
  return ssp(ctx, (ssr) => [ssr.prefetchQuery("field.getAll")]);
};

export default function CreateCompanyPage() {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [fields, setFields] = useState<Field[]>([]);

  useMemo(() => {
    setLink(name.toLowerCase().replace(/\s/g, "-"));
  }, [name]);

  function removeField(id: string) {
    setFields((fields) => fields.filter((field) => field.id !== id));
  }

  return (
    <ProtectedPage>
      <Head>
        <title>Criar Evento / RibeiroLabs</title>
      </Head>

      <div className="w-content">
        <form className="form max-w-lg mx-auto">
          <h2 className="mt-0">Informações do Evento</h2>

          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
          />

          <Input
            label="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            leading={<span>/</span>}
            name="link"
          />

          <Input label="Descrição" type="textarea" name="description" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" name="date" />

            <Input label="Confirmar até" type="date" name="confirmation_date" />
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
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => {
                  return (
                    <tr key={field.id}>
                      <th>{i + 1}</th>
                      <td>{field.name}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => removeField(field.id)}
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td colSpan={3}>
                    <button
                      className="btn btn-outline btn-xs"
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
            <button className="btn btn-ghost" type="button">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <FieldModal
        onSelect={(field) => setFields((fields) => fields.concat(field))}
      />
    </ProtectedPage>
  );
}

const FieldModal = ({ onSelect }: { onSelect: (field: Field) => void }) => {
  const fields = trpc.useQuery(["field.getAll"]);
  const [opened, setOpened] = useState(false);
  const [fieldId, setFieldId] = useState("");

  useEvent(
    "modal",
    useCallback((e) => {
      if (e.detail.id !== "select-field-modal") {
        return;
      }

      setOpened(e.detail.action === "open");
    }, [])
  );

  const field = useMemo(() => {
    return fields.data?.find((field) => field.id === fieldId);
  }, [fields, fieldId]);

  function onConfirm() {
    if (field == null) {
      addToast("Selecione uma informação", "error");
      return;
    }

    onSelect(field);
    setOpened(false);
  }

  return (
    <>
      <div
        className="modal modal-bottom sm:modal-middle"
        data-open={opened}
        key={String(opened)}
      >
        <div className="modal-box border border-base-300 w-fit">
          <h3 className="font-bold text-lg">
            Escolher Informação de Convidado
          </h3>

          <div className="overflow-x-auto">
            <table className="table w-full border border-base-300 table-compact">
              <tbody>
                {fields.data?.map((field, i) => {
                  return (
                    <>
                      <tr key={field.id}>
                        <td className="w-[56px]">
                          <input type="checkbox" className="toggle" />
                        </td>
                        <td>
                          <span>{field.name}</span>
                          <span className="badge badge-info badge-sm ml-2 font-bold">
                            {field.type}
                          </span>
                        </td>
                        <td>{field.description}</td>
                      </tr>

                      {field.options?.map((option) => (
                        <tr key={option.id} className="active text-xs">
                          <td></td>
                          <td colSpan={2}>{option.name}</td>
                          <td>{option.description}</td>
                        </tr>
                      ))}
                    </>
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
    </>
  );
};
