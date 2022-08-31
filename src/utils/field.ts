import { FieldCategory, FieldType } from "@prisma/client";

const TYPES: Record<FieldType, string> = {
  TEXT: "texto",
  OPTION: "opções",
  NUMBER: "numérico",
};

export const getTypeText = (type: FieldType) => {
  return TYPES[type];
};

const CATEGORIES: Record<FieldCategory, string> = {
  NAME: "nome",
  AGE: "idade",
  EMAIL: "email",
};

export const getCategoryText = (category: FieldCategory) => {
  return CATEGORIES[category];
};
