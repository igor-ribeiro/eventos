import { Input } from "@common/components/Input";
import {
  closeModal,
  Modal,
  ModalCancelButton,
  useModalEvent,
} from "@common/components/Modal";
import { addToast } from "@common/components/Toast";
import { FormEvent, useCallback, useMemo, useState } from "react";

const MODAL_ID = "select-dates-modal";

export const SelectDatesModal = ({
  onConfirm,
}: {
  onConfirm: (data: { date: string; confirmationDeadline: string }) => void;
}) => {
  const [date, setDate] = useState("");
  const [confirmationDeadline, setConfirmationDeadline] = useState("");

  useModalEvent(
    MODAL_ID,
    useCallback((detail) => {
      if (detail.action === "open") {
        const { date, confirmationDeadline } = detail.data ?? {};

        setDate(date || "");

        setConfirmationDeadline(confirmationDeadline || "");
      }
    }, [])
  );

  function confirm(e: FormEvent) {
    e.preventDefault();

    if (!date) {
      addToast("Escolha a data do evento", "error");
      return;
    }

    onConfirm({ date, confirmationDeadline });
    closeModal(MODAL_ID);
  }

  const maxConfirmationDeadline = useMemo(() => {
    if (!date) {
      return "";
    }

    const today = new Date();
    const max = new Date(date);

    max.setHours(today.getHours());
    max.setMinutes(today.getMinutes());

    return max.toISOString().replace(/T.+$/, "");
  }, [date]);

  return (
    <Modal id={MODAL_ID}>
      <form onSubmit={confirm}>
        <div className="modal-content grid md:grid-cols-2 gap-4">
          <Input
            autoFocus
            label="Data do evento"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Prazo para confirmação"
            type="date"
            value={confirmationDeadline}
            max={maxConfirmationDeadline}
            onChange={(e) => setConfirmationDeadline(e.target.value)}
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
