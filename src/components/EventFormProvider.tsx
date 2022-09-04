import slugify from "slugify";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { inferMutationInput } from "@/utils/trpc";
import { createEventInput } from "@/server/inputs/event";
import { fillDateTime } from "@/utils/date";

function clone<T>(item: T) {
  return JSON.parse(JSON.stringify(item)) as T;
}

type EventFormValue = {
  data: Omit<
    inferMutationInput<"event.create">,
    "date" | "confirmationDeadline"
  > & {
    date?: Date;
    confirmationDeadline?: Date;
  };
  linkSynced: boolean;
  isValid: boolean;
};

const DEFAULT_VALUE: EventFormValue = {
  data: {
    name: "Nome do evento",
    link: "nome-do-evento",
    description: "descrição do evento",
    imageUrl: "",
    date: undefined,
    confirmationDeadline: undefined,
    fields: [],
  },
  linkSynced: true,
  isValid: false,
};

export const EventFormValueContext = createContext<EventFormValue>(
  clone(DEFAULT_VALUE)
);

type EventFormActions<
  Key extends keyof EventFormValue["data"] = keyof EventFormValue["data"],
  Value = EventFormValue["data"][Key]
> = {
  set: (name: Key, value: Value) => void;
  syncLink: () => void;
  reset: () => void;
};

export const EventFormActionsContext = createContext<EventFormActions>({
  set: () => void {},
  reset: () => void {},
  syncLink: () => void {},
});

type Action<
  Key extends keyof EventFormValue["data"] = keyof EventFormValue["data"]
> =
  | {
      type: "SET";
      name: Key;
      value: EventFormValue["data"][Key];
    }
  | {
      type: "RESET";
    }
  | {
      type: "TOGGLE_SYNC_LINK";
    };

function reducer(state: EventFormValue, action: Action) {
  function getLink(value: string) {
    return slugify(value, {
      lower: true,
    });
  }

  function isValid(data: EventFormValue["data"]) {
    const response = createEventInput.safeParse({
      ...data,
      date: fillDateTime(data.date as any as string),
      confirmationDeadline: data.confirmationDeadline
        ? fillDateTime(data.confirmationDeadline as any as string)
        : null,
    });

    return response.success;
  }

  const next = clone(state);

  if (action.type === "SET") {
    next.data[action.name] = action.value as any;

    if (action.name === "name" && state.linkSynced) {
      next.data.link = getLink(action.value as string);
    }

    if (action.name === "link") {
      if (action.value !== state.data.link) {
        next.data.link = getLink(action.value as string).replace(/-$/, "");
        next.linkSynced = false;
      }
    }

    next.isValid = isValid(next.data);

    return next;
  }

  if (action.type === "TOGGLE_SYNC_LINK") {
    const synced = !state.linkSynced;

    if (synced) {
      next.data.link = getLink(state.data.name);
    }

    next.linkSynced = synced;

    next.isValid = isValid(next.data);

    return next;
  }

  if (action.type === "RESET") {
    return clone(DEFAULT_VALUE);
  }

  return state;
}

export const EventFormProvider = ({ children }: PropsWithChildren) => {
  const [state, send] = useReducer(reducer, DEFAULT_VALUE, (value) =>
    clone(value)
  );

  const set = useCallback<EventFormActions["set"]>((name, value) => {
    send({ type: "SET", name, value });
  }, []);

  const reset = useCallback<EventFormActions["reset"]>(() => {
    send({ type: "RESET" });
  }, []);

  const syncLink = useCallback<EventFormActions["syncLink"]>(() => {
    send({ type: "TOGGLE_SYNC_LINK" });
  }, []);

  const actions = useMemo(
    () => ({
      set,
      reset,
      syncLink,
    }),
    [set, reset, syncLink]
  );

  return (
    <EventFormValueContext.Provider value={state}>
      <EventFormActionsContext.Provider value={actions}>
        {children}
      </EventFormActionsContext.Provider>
    </EventFormValueContext.Provider>
  );
};

export const useEventFormValue = () => useContext(EventFormValueContext);
export const useEventFormActions = () => useContext(EventFormActionsContext);
