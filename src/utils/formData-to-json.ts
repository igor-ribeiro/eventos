type Json = {
  [key: string]: string;
};

export function formDataToJson<T extends Json>(data: FormData): T {
  return Array.from(data.entries()).reduce((json, [name, value]) => {
    json[name as keyof T] = value as T[keyof T];
    return json;
  }, {} as T);
}
