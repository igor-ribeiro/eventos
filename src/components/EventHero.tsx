import { fillDateTime } from "@/utils/date";
import { CalendarIcon } from "@common/components/Icons";
import format from "date-fns/format";
import { forwardRef, PropsWithChildren } from "react";

export const EventHeroTitle = forwardRef<HTMLHeadingElement, PropsWithChildren>(
  function EventHeroTitle(props, ref) {
    return (
      <h1
        className="text-white md:text-5xl mb-4 uppercase"
        {...props}
        ref={ref}
      />
    );
  }
);

export const EventHeroDescription = forwardRef<HTMLParagraphElement, PropsWithChildren>(
  function EventHeroDescription(props, ref) {
    return (
      <p className="mb-4 font-bold text-1md leading-5" {...props} ref={ref} />
    );
  }
);

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
