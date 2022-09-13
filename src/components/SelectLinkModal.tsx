import slugify from "slugify";
import { Input } from "@common/components/Input";
import { addToast } from "@common/components/Toast";
import { useEvent } from "@ribeirolabs/events/react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useEventFormActions, useEventFormValue } from "./EventFormProvider";
import {
  closeModal,
  Modal,
  ModalCancelButton,
  useModalEvent,
} from "@common/components/Modal";

const MODAL_ID = "select-link-modal";

export const SelectLinkModal = ({
  onConfirm,
}: {
  onConfirm: (link: string) => void;
}) => {
  const [link, setLink] = useState("");

  useModalEvent(
    MODAL_ID,
    useCallback((detail) => {
      if (detail.action === "open") {
        setLink(detail.data?.link ?? "");
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
    closeModal(MODAL_ID);
  }

  return (
    <Modal id={MODAL_ID}>
      <form onSubmit={confirm}>
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
          <ModalCancelButton modalId={MODAL_ID} />
          <button className="btn" type="submit">
            Confirmar
          </button>
        </div>
      </form>
    </Modal>
  );
};
