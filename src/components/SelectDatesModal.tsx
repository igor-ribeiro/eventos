import { Input } from "@common/components/Input";
import { addToast } from "@common/components/Toast";
import { useEvent } from "@ribeirolabs/events/react";
import { FormEvent, useCallback, useMemo, useState } from "react";

export const SelectDatesModal = ({
  onConfirm,
}: {
  onConfirm: (data: { date: string; confirmationDeadline: string }) => void;
}) => {
  const [date, setDate] = useState("");
  const [confirmationDeadline, setConfirmationDeadline] = useState("");

  const [opened, setOpened] = useState(false);

  useEvent(
    "modal",
    useCallback((e) => {
      if (e.detail.id !== "select-dates-modal") {
        return;
      }

      const isOpen = e.detail.action === "open";

      setOpened(isOpen);

      if (isOpen) {
        const { date, confirmationDeadline } = e.detail.data as {
          date?: string;
          confirmationDeadline?: string;
        };

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

    setOpened(false);
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
    <>
      <input
        type="checkbox"
        id="select-dates-modal"
        className="modal-toggle"
        checked={opened}
        onChange={(e) => setOpened(e.target.checked)}
      />

      <label
        htmlFor="select-dates-modal"
        className="modal cursor-pointer"
        key={"opened-" + opened}
      >
        <form className="modal-box" onSubmit={confirm}>
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
