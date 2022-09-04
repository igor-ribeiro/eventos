import {
  EventFormProvider,
  useEventFormActions,
  useEventFormValue,
} from "@/components/EventFormProvider";
import { Hero } from "@/components/Hero";
import { SelectDatesModal } from "@/components/SelectDatesModal";
import { SelectFieldModal } from "@/components/SelectFieldModal";
import { SelectLinkModal } from "@/components/SelectLinkModal";
import { fillDateTime } from "@/utils/date";
import { trpc } from "@/utils/trpc";
import { uploadFile } from "@/utils/upload-file";
import {
  CalendarIcon,
  IdentificationIcon,
  ImageIcon,
  LinkIcon,
  SyncIcon,
} from "@common/components/Icons";
import { ProtectedPage } from "@common/components/ProtectedPage";
import { addToast } from "@common/components/Toast";
import { ssp } from "@common/server/ssp";
import { dispatchCustomEvent } from "@ribeirolabs/events";
import { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  ClipboardEvent,
  cloneElement,
  FormEvent,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";

const GCLOUD_ACCESS_TOKEN =
  "ya29.a0AVA9y1uj_5eKo0w1ZyW-1qhYrweTLEedldPimlYpZj4m8T4g4UDBHr1tgXtjPRqC9ozRB6LD_lQ3VHeIaWK6CEFJ05Wz_n1UGgeMDUURDZ6EyHhvnL0NuR6FJbKN2YH4wzv8tgWTIFNW3_c5qaWNVybo3WlDaCgYKATASAQASFQE65dr8R6AfbF3-A-bcpfIO7rKZBw0163";

export const getServerSideProps: GetServerSideProps = (ctx) =>
  ssp(ctx, () => {
    return Promise.resolve();
  });

const EventPage: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/criar");
    }
  }, [router, status]);

  return (
    <ProtectedPage>
      <EventFormProvider>
        <EventForm />
      </EventFormProvider>
    </ProtectedPage>
  );
};

const EventForm = () => {
  const router = useRouter();
  const { data, isValid, linkSynced } = useEventFormValue();
  const actions = useEventFormActions();
  const [uploading, setUploading] = useState(false);
  const [creationStep, setCreationStep] = useState("");

  const fields = trpc.useQuery([
    "field.get",
    {
      fields: data.fields,
    },
  ]);

  const create = trpc.useMutation("event.create");

  const inputRef = useRef<HTMLInputElement>(null);

  const isCreating = true;

  async function onImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      addToast("Selecione uma imagem", "error");

      return;
    }

    URL.revokeObjectURL(data.imageUrl);
    actions.set("imageUrl", URL.createObjectURL(file));
  }

  function onTriggerImageUpload() {
    inputRef.current!.click();
  }

  async function onCreate() {
    const file = inputRef.current!.files![0]!;

    try {
      setUploading(true);

      setCreationStep("Salvando imagem...");

      const imageUrl = await uploadFile(file);

      URL.revokeObjectURL(data.imageUrl);

      try {
        setCreationStep("Criando evento...");

        const event = await create.mutateAsync({
          ...data,
          imageUrl,
          date: fillDateTime(data.date as any as string),
          confirmationDeadline: fillDateTime(
            data.confirmationDeadline as any as string
          ),
        });

        addToast(`Evento "${event.name}" criado`, "success");

        actions.reset();

        router.push(`/${event.link}`);
      } catch (e: any) {
        console.error(e);
        addToast("Não foi possível criar o evento, tente novamente", "error");
      }
    } catch (e: any) {
      console.error(e);
      addToast("Não foi possível usar essa imagem", "error");

      return;
    } finally {
      setUploading(false);
      setCreationStep("");
    }
  }

  return (
    <div className="relative -m-4">
      <div className="absolute top-0 left-0 w-full z-10 p-4 flex items-center justify-center gap-2">
        <ToolbarButton
          label="Imagem"
          completed={Boolean(data.imageUrl)}
          onClick={onTriggerImageUpload}
        >
          <ImageIcon />
        </ToolbarButton>

        <ToolbarButton
          label="Datas"
          completed={Boolean(data.date)}
          onClick={() =>
            dispatchCustomEvent("modal", {
              id: "select-dates-modal",
              action: "open",
              data: {
                date: data.date,
                confirmationDeadline: data.confirmationDeadline,
              },
            })
          }
        >
          <CalendarIcon />
        </ToolbarButton>

        <ToolbarButton
          label="Convidados"
          completed={data.fields.length > 0}
          onClick={() =>
            dispatchCustomEvent("modal", {
              id: "select-field-modal",
              action: "open",
              data: {
                fields: data.fields,
              },
            })
          }
        >
          <IdentificationIcon />
        </ToolbarButton>

        <ToolbarButton
          label="Link"
          completed={Boolean(data.link)}
          onClick={() =>
            dispatchCustomEvent("modal", {
              id: "select-link-modal",
              action: "open",
              data: {
                link: data.link,
              },
            })
          }
        >
          <LinkIcon />
        </ToolbarButton>
      </div>

      <input
        ref={inputRef}
        onChange={onImageUpload}
        type="file"
        accept="image/*"
        name="file"
        style={{
          display: "none",
        }}
      />

      <Hero position="end" image={data.imageUrl}>
        <div className="flex gap-1 justify-center my-2">
          <button
            className="btn btn-sm lowercase"
            onClick={() =>
              dispatchCustomEvent("modal", {
                id: "select-link-modal",
                action: "open",
                data: {
                  link: data.link,
                },
              })
            }
          >
            <span className="text-xs">/{data.link}</span>
          </button>

          <button
            className={`btn btn-circle btn-sm ${
              linkSynced ? "btn-success" : ""
            }`}
            onClick={() => actions.syncLink()}
          >
            <SyncIcon size={14} />
          </button>
        </div>

        <Editable
          name="name"
          value={data.name}
          onChange={(value) => actions.set("name", value)}
        >
          <h1 className="text-white md:text-5xl mb-4 uppercase" />
        </Editable>

        <Editable
          name="description"
          value="Descrição do evento"
          onChange={(value) => actions.set("description", value)}
        >
          <p className="mb-4 font-bold text-1md leading-5" />
        </Editable>
      </Hero>

      <div className="w-content w-content-sm mx-auto p-3">
        {fields.data?.map((field, i) => {
          if (["TEXT", "NUMBER"].includes(field.type)) {
            return (
              <div className="form-control mb-4" key={field.id}>
                <label className="label font-bold" htmlFor={field.id}>
                  {field.name}
                </label>
                <input
                  name={field.id}
                  type={field.type}
                  className="input input-bordered w-full"
                  autoFocus={i === 0 && !isCreating}
                />
              </div>
            );
          }

          if (field.type === "OPTION") {
            return (
              <div className="form-control mb-4" key={field.id}>
                <label className="label font-bold" htmlFor={field.id}>
                  {field.name}
                </label>
                <select
                  name={field.id}
                  className="select select-bordered w-full"
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}{" "}
                      {option.description && `- ${option.description}`}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return null;
        })}

        {isCreating ? null : (
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
        )}

        <button
          className="btn btn-primary btn-block my-4"
          disabled={!isValid}
          data-loading={create.isLoading || uploading}
          onClick={onCreate}
        >
          {creationStep || "Criar evento"}
        </button>
      </div>

      <SelectFieldModal onSelect={(fields) => actions.set("fields", fields)} />
      <SelectLinkModal onConfirm={(link) => actions.set("link", link)} />
      <SelectDatesModal
        onConfirm={(dates) => {
          actions.set("date", dates.date);
          actions.set("confirmationDeadline", dates.confirmationDeadline);
        }}
      />
    </div>
  );
};

const ToolbarButton = ({
  label,
  onClick,
  completed,
  children,
}: PropsWithChildren<{
  label: string;
  onClick: () => void;
  completed?: boolean;
}>) => {
  return (
    <div className="indicator">
      {!completed && (
        <span className="indicator-center indicator-item badge badge-secondary animate-pulse rounded-full badge-xs"></span>
      )}

      <button
        className={`btn  flex-col ${
          completed ? "btn-success" : "animate-pulse"
        }`}
        onClick={onClick}
        title={label}
      >
        <>
          {children}
          <span className="text-xs md:inline-block">{label}</span>
        </>
      </button>
    </div>
  );
};

const Editable = ({
  children,
  name,
  value,
  onChange = () => void {},
}: {
  children: ReactElement;
  name: string;
  value: string;
  onChange?: (value: string) => void;
}) => {
  const internal = useRef(value);
  const { status } = useSession();

  const ref = useRef<HTMLElement>(null);

  const loggedIn = status === "authenticated";

  useEffect(() => {
    if (!ref.current || !internal.current) {
      return;
    }

    ref.current.textContent = internal.current;
  }, []);

  return (
    <>
      <div className={`${loggedIn ? "editable" : ""} block`}>
        {cloneElement(children, {
          ref,
          contentEditable: loggedIn,
          dangerouslySetInnerHTML: {
            __html: "",
          },
          onFocus(e: MouseEvent) {
            requestAnimationFrame(() => {
              if (window.getSelection && document.createRange) {
                const range = document.createRange();
                range.selectNodeContents(e.target as HTMLElement);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
              }
            });
          },
          onInput(e: FormEvent<HTMLElement>) {
            const value = (e.target as HTMLElement).textContent ?? "";

            onChange(value);
          },
          onPaste(e: ClipboardEvent<HTMLElement>) {
            e.preventDefault();
            const value = e.clipboardData.getData("text/plain");
            const target = e.target as HTMLElement;

            target.textContent = value;

            onChange(value);
          },
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </>
  );
};

export default EventPage;
