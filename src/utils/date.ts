export const fillDateTime = (date: string | Date) => {
  if (date instanceof Date) {
    return date;
  }

  const [onlyDate] = date.split("T") as string[];

  const [_todayDate, todayTime] = new Date().toISOString().split("T");

  return new Date([onlyDate, todayTime].join("T"));
};
