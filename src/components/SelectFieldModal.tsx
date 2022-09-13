import { getCategoryText, getTypeText } from "@/utils/field";
import { trpc } from "@/utils/trpc";
import {
  closeModal,
  Modal,
  ModalCancelButton,
  useModalEvent,
} from "@common/components/Modal";
import { addToast } from "@common/components/Toast";
import { FieldCategory } from "@prisma/client";
import { useState, useCallback } from "react";

const MODAL_ID = "select-field-modal";

export const SelectFieldModal = ({
  onSelect,
}: {
  onSelect: (fields: string[]) => void;
}) => {
  const fields = trpc.useQuery(["field.get"]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    Partial<Record<FieldCategory, boolean>>
  >({});

  useModalEvent(
    MODAL_ID,
    useCallback((detail: Events["modal"]) => {
      if (detail.action === "open") {
        setSelectedIds(detail.data?.fields ?? []);
      }
    }, [])
  );

  function onConfirm() {
    if (selectedIds.length === 0) {
      addToast("Selecione ao menos uma informação", "error");
      return;
    }

    onSelect(selectedIds);
    closeModal(MODAL_ID);
  }

  return (
    <Modal id={MODAL_ID}>
      <div className="modal-content">
        <h2 className="text-center">Informações dos Convidados</h2>

        <div className="overflow-x-auto">
          <table className="table w-full border border-base-300 table-compact">
            <thead>
              <tr>
                <th className="w-[10ch]">Escolher</th>
                <th>Nome</th>
                <th className="w-[10ch] text-center">Tipo</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {fields.data?.map((field, i) => {
                const Container = field.options.length > 0 ? "details" : "div";

                const Name = field.options.length > 0 ? "summary" : "div";

                const isSelected = selectedIds.includes(field.id);

                const isDisabled =
                  selectedCategories[field.category] && !isSelected;

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
                        checked={isSelected}
                        title={
                          isDisabled
                            ? `Você já selecionou um campo de ${getCategoryText(
                                field.category
                              )}`
                            : ""
                        }
                        onChange={(e) => {
                          const isSelected = e.target.checked;

                          setSelectedIds((selected) => {
                            if (isSelected) {
                              return selected.concat(field.id);
                            }

                            return selected.filter((id) => id !== field.id);
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
                        <Name className="font-bold">{field.name}</Name>
                        {field.options?.map((option) => (
                          <ul key={option.id} className="active text-xs">
                            <li>
                              {option.name} - {option.description}
                            </li>
                          </ul>
                        ))}
                      </Container>
                    </td>
                    <td className="text-center">
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
      </div>

      <div className="modal-action">
        <ModalCancelButton modalId={MODAL_ID} />
        <button className="btn" onClick={onConfirm}>
          Confirmar
        </button>
      </div>
    </Modal>
  );
};
