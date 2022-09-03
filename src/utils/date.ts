export const fillDateTime = (date: string) => {
  const filled = new Date(date);
  filled.setHours(12);
  filled.setMinutes(0);
  filled.setSeconds(0);

  return filled;
};
