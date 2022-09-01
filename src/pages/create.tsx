import { Hero } from "@/components/Hero";
import { UploadIcon } from "@/components/Icons";
import { getCategoryText, getTypeText } from "@/utils/field";
import { trpc } from "@/utils/trpc";
import { addToast } from "@common/components/Toast";
import { ssp } from "@common/server/ssp";
import { Field, FieldCategory, FieldOption } from "@prisma/client";
import { dispatchCustomEvent } from "@ribeirolabs/events";
import { useEvent } from "@ribeirolabs/events/react";
import { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  ClipboardEvent,
  cloneElement,
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const getServerSideProps: GetServerSideProps = (ctx) =>
  ssp(ctx, () => {
    return Promise.resolve();
  });

type FieldWithOptions = Field & {
  options: FieldOption[];
};

type SelectedField = {
  id: string;
  field: FieldWithOptions;
};

const Editable = ({
  children,
  name,
  defaultValue,
}: {
  children: ReactElement;
  name: string;
  defaultValue: string;
}) => {
  const [value, setValue] = useState(defaultValue);
  const { status } = useSession();

  const ref = useRef<HTMLElement>(null);

  const loggedIn = status === "authenticated";

  return (
    <>
      <div className={`${loggedIn ? "editable" : ""} block`}>
        {cloneElement(children, {
          ref,
          contentEditable: loggedIn,
          dangerouslySetInnerHTML: {
            __html: defaultValue,
          },
          onInput: (e: FormEvent<HTMLElement>) => {
            setValue((e.target as HTMLElement).textContent ?? "");
          },
          onPaste: (e: ClipboardEvent<HTMLElement>) => {
            e.preventDefault();
            const value = e.clipboardData.getData("text/plain");
            const target = e.target as HTMLElement;

            target.textContent = value;

            setValue(value);
          },
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </>
  );
};

const EventPage: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [fields, setFields] = useState<SelectedField[]>([]);
  const [image, setImage] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/create");
    }
  }, [router, status]);

  async function onImportEvent(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      addToast("Selecione uma imagem", "error");

      return;
    }

    setImage(URL.createObjectURL(file));
  }

  function onTriggerImportEvent() {
    inputRef.current!.click();
  }

  return (
    <div>
      <Hero position="end" image={image}>
        <Editable name="name" defaultValue="Nome do evento">
          <h1 className="text-white md:text-5xl mb-4 uppercase" />
        </Editable>

        <Editable name="description" defaultValue="Descrição do evento">
          <p className="mb-4 font-bold text-1md leading-5" />
        </Editable>

        <input
          ref={inputRef}
          onChange={onImportEvent}
          type="file"
          accept="image/*"
          name="file"
          style={{
            display: "none",
          }}
        />

        <button
          className="btn btn-circle absolute top-4 left-1/2 translate-x--1/2"
          onClick={onTriggerImportEvent}
          title="Importar Evento"
        >
          <UploadIcon />
        </button>
      </Hero>

      <form className="max-w-[600px] mx-auto p-3" action="">
        <div className="text-center">
          <button
            className="btn btn-sm my-4 btn-secondary"
            type="button"
            onClick={() =>
              dispatchCustomEvent("modal", {
                id: "select-field-modal",
                action: "open",
                data: {
                  fields: fields.map(({ field }) => field),
                },
              })
            }
          >
            Escolher informações dos convidados
          </button>
        </div>

        {fields.map(({ id, field }, i) => {
          if (["TEXT", "NUMBER"].includes(field.type)) {
            return (
              <div className="form-control mb-4" key={id}>
                <label className="label font-bold" htmlFor={field.id}>
                  {field.name}
                </label>
                <input
                  name={field.id}
                  type={field.type}
                  className="input input-bordered w-full"
                  autoFocus={i === 0}
                />
              </div>
            );
          }

          if (field.type === "OPTION") {
            return (
              <div className="form-control mb-4" key={id}>
                <label className="label font-bold" htmlFor={field.id}>
                  {field.name}
                </label>
                <select
                  name={field.id}
                  className="select select-bordered w-full"
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return null;
        })}

        <div className="grid gap-2 md:grid-cols-2">
          <button
            className="btn btn"
            type="submit"
            name="action"
            value="next"
            disabled
          >
            Próximo Convidado
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            name="action"
            value="finalize"
            disabled
          >
            Finalizar
          </button>
        </div>

        <div className="divider"></div>

        <button className="btn btn-primary btn-block my-4" type="submit">
          Criar evento
        </button>
      </form>

      <FieldModal
        onSelect={(fields) =>
          setFields(
            fields.map((field) => ({
              id: crypto.randomUUID(),
              field,
            }))
          )
        }
      />
    </div>
  );
};

export default EventPage;

const FieldModal = ({
  onSelect,
}: {
  onSelect: (fields: FieldWithOptions[]) => void;
}) => {
  const fields = trpc.useQuery(["field.getAll"]);
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<FieldWithOptions[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    Partial<Record<FieldCategory, boolean>>
  >({});

  useEvent(
    "modal",
    useCallback((e) => {
      if (e.detail.id !== "select-field-modal") {
        return;
      }

      const isOpen = e.detail.action === "open";

      setOpened(isOpen);

      if (isOpen) {
        setSelected((e.detail.data as { fields: FieldWithOptions[] }).fields);
      }
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
