import { inferQueryOutput } from "@/utils/trpc";
import { closeModal, Modal, ModalCancelButton } from "@common/components/Modal";
import { addToast } from "@common/components/Toast";
import { FormEvent, useState } from "react";

const MODAL_ID = "guest-grouping-modal";

export const GuestGroupingModal = ({
  event,
  onConfirm,
}: {
  event: inferQueryOutput<"event.getListByLink">;
  onConfirm: (data: { field: string; values: [string, number][] }) => void;
}) => {
  const [fieldId, setFieldId] = useState("");

  function onGroup(e: FormEvent) {
    e.preventDefault();

    if (!fieldId) {
      addToast("Selecione o campo agrupador", "error");
      return;
    }

    const field = event.fields.find(({ field }) => field.id === fieldId);

    if (field == null) {
      addToast("Campo não encontrado", "error");
      return;
    }

    const group = event.guests.reduce((values, guest) => {
      const field = guest.fields.find((field) => field.fieldId === fieldId);

      if (field == null) {
        return values;
      }

      if (field.value in values === false) {
        values[field.value] = 0;
      }

      if (field.field.type === "NUMBER") {
        values[field.value] += parseInt(field.value);
      } else {
        ++values[field.value];
      }

      return values;
    }, {} as Record<string, number>);

    onConfirm({
      field: field.field.name,
      values: Object.entries(group),
    });

    closeModal(MODAL_ID);
  }

  return (
    <Modal id={MODAL_ID}>
      <form onSubmit={onGroup}>
        <div className="modal-content">
          <div className="form-control mb-4">
            <label className="label font-bold" htmlFor="">
              Agrupar por
            </label>
            <select
              name="field"
              className="select select-bordered w-full"
              required
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
            >
              <option></option>
              {event.fields
                .filter(({ field }) => field.type !== "TEXT")
                .map(({ field }) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
            </select>
          </div>
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
