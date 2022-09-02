import { getCategoryText, getTypeText } from "@/utils/field";
import { trpc } from "@/utils/trpc";
import { addToast } from "@common/components/Toast";
import { Field, FieldCategory, FieldOption } from "@prisma/client";
import { useEvent } from "@ribeirolabs/events/react";
import { useState, useCallback, useMemo } from "react";

type FieldWithOptions = Field & {
  options: FieldOption[];
};

export const SelectFieldModal = ({
  onSelect,
}: {
  onSelect: (fields: string[]) => void;
}) => {
  const fields = trpc.useQuery(["field.get"]);
  const [opened, setOpened] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    Partial<Record<FieldCategory, boolean>>
  >({});

  const selected = useMemo(
    () => fields.data?.filter((field) => selectedIds.includes(field.id)),
    [selectedIds, fields.data]
  );

  useEvent(
    "modal",
    useCallback((e) => {
      if (e.detail.id !== "select-field-modal") {
        return;
      }

      const isOpen = e.detail.action === "open";

      setOpened(isOpen);

      if (isOpen) {
        setSelectedIds((e.detail.data as { fields: string[] }).fields);
      }
    }, [])
  );

  function onConfirm() {
    if (selectedIds.length === 0) {
      addToast("Selecione ao menos uma informação", "error");
      return;
    }

    onSelect(selectedIds);
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
