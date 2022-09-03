export const fillDateTime = (date: string) => {
  const today = new Date();

  const filled = new Date(date);
  filled.setHours(today.getHours());
  filled.setMinutes(today.getMinutes());

  return filled;
};
