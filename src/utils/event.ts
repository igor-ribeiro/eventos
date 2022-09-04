import { shareOrCopy } from "@common/utils/share";
import { Event } from "@prisma/client";

export const shareEvent = (event: Event) =>
  shareOrCopy({
    url: `${window.location.origin}/${event.link}`,
    text: event.name,
  });
