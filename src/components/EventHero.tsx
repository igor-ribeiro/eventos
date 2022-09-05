import { fillDateTime } from "@/utils/date";
import { CalendarIcon } from "@common/components/Icons";
import format from "date-fns/format";

export const EventHeroDates = ({
  date,
  confirmationDeadline,
  onClick,
}: {
  date?: string | Date | null;
  confirmationDeadline?: string | Date | null;
  onClick?: () => void;
}) => {
  return (
    <div
      className="flex justify-between text-xs font-bold border-t pt-2"
      onClick={onClick}
    >
      {date && (
        <div className="flex items-center gap-1">
          <CalendarIcon />
          <span>{format(fillDateTime(date), "dd/MM/yyyy")}</span>
        </div>
      )}

      {confirmationDeadline && (
        <span>
          Confirmar até{" "}
          {format(fillDateTime(confirmationDeadline), "dd/MM/yyyy")}
        </span>
      )}
    </div>
  );
};
