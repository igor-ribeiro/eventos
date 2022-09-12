import slugify from "slugify";
import { Input } from "@common/components/Input";
import { addToast } from "@common/components/Toast";
import { useEvent } from "@ribeirolabs/events/react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useEventFormActions, useEventFormValue } from "./EventFormProvider";

export const SelectLinkModal = ({
  onConfirm,
}: {
  onConfirm: (link: string) => void;
}) => {
  const [link, setLink] = useState("");

  const [opened, setOpened] = useState(false);

  useEvent(
    "modal",
    useCallback((e) => {
      if (e.detail.id !== "select-link-modal") {
        return;
      }

      const isOpen = e.detail.action === "open";

      setOpened(isOpen);

      if (isOpen) {
        setLink((e.detail.data as { link: string }).link);
      }
    }, [])
  );

  function confirm(e: FormEvent) {
    e.preventDefault();

    if (!link) {
      addToast("Escolha o link do evento", "error");
      return;
    }

    onConfirm(link);

    setOpened(false);
  }

  return (
    <>
      <input
        type="checkbox"
        id="select-link-modal"
        className="modal-toggle"
        checked={opened}
        onChange={(e) => setOpened(e.target.checked)}
      />

      <label
        htmlFor="select-link-modal"
        className="modal cursor-pointer"
        key={`opened-${opened.toString()}`}
      >
        <form className="modal-box" onSubmit={confirm}>
          <div className="modal-content">
            <Input
              autoFocus
              label="Link do evento"
              value={link}
              onChange={(e) => {
                e.preventDefault();

                const link = slugify(e.target.value, {
                  lower: true,
                  trim: false,
                });

                setLink(link);
              }}
            />
          </div>

          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setOpened(false)}
              type="button"
            >
              Cancelar
            </button>
            <button className="btn" type="submit">
              Confirmar
            </button>
          </div>
        </form>
      </label>
    </>
  );
};
