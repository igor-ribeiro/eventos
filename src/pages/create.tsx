import { Hero } from "@/components/Hero";
import { SelectFieldModal } from "@/components/SelectFieldModal";
import {
  CalendarIcon,
  IdentificationIcon,
  ImageIcon,
} from "@common/components/Icons";
import { addToast } from "@common/components/Toast";
import { ssp } from "@common/server/ssp";
import { Field, FieldOption } from "@prisma/client";
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

const EventPage: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [fields, setFields] = useState<SelectedField[]>([]);
  const [image, setImage] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const isCreating = true;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/create");
    }
  }, [router, status]);

  async function onImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      addToast("Selecione uma imagem", "error");

      return;
    }

    setImage(URL.createObjectURL(file));
  }

  function onTriggerImageUpload() {
    inputRef.current!.click();
  }

  const isInvalid = fields.length === 0 || !image;

  return (
    <div>
      <div className="fixed top-0 left-0 w-full z-10 pt-4 flex items-center justify-center gap-2">
        <ToolbarButton label="Datas" onClick={() => void {}}>
          <CalendarIcon />
        </ToolbarButton>

        <ToolbarButton
          label="Convidados"
          completed={fields.length > 0}
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
          <IdentificationIcon />
        </ToolbarButton>

        <ToolbarButton
          label="Imagem"
          completed={Boolean(image)}
          onClick={onTriggerImageUpload}
        >
          <ImageIcon />
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

      <Hero position="end" image={image}>
        <Editable name="name" defaultValue="Nome do evento">
          <h1 className="text-white md:text-5xl mb-4 uppercase" />
        </Editable>

        <Editable name="description" defaultValue="Descrição do evento">
          <p className="mb-4 font-bold text-1md leading-5" />
        </Editable>
      </Hero>

      <form className="max-w-[600px] mx-auto p-3" action="">
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
          type="submit"
          disabled={isInvalid}
        >
          Criar evento
        </button>
      </form>

      <SelectFieldModal
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
        <span className="indicator-top indicator-center indicator-item badge badge-secondary animate-pulse rounded-full badge-sm"></span>
      )}

      <button
        className={`btn gap-2 ${completed ? "btn-success" : "animate-pulse"}`}
        onClick={onClick}
        title={label}
      >
        <>
          {!completed && <span className="text-xs">{label}</span>}
          {children}
        </>
      </button>
    </div>
  );
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
            setValue((e.target as HTMLElement).textContent ?? "");
          },
          onPaste(e: ClipboardEvent<HTMLElement>) {
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

export default EventPage;
