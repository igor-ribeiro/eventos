const COL_SEPARATOR = ";";
const LINE_SEPARATOR = "\n";

export function generateCsv<T>(
  headers: {
    label: string;
    name: string;
    format?: (value: any) => string;
  }[],
  entries: T[]
): string {
  const data: string[] = [
    headers.map((header) => header.label).join(COL_SEPARATOR),
  ];

  let line: string[] = [];

  for (const entry of entries) {
    for (const header of headers) {
      const value = entry[header.name as keyof T] as any as string;
      line.push(header.format ? header.format(value) : value);
    }

    data.push(line.join(COL_SEPARATOR));
    line = [];
  }

  return data.join(LINE_SEPARATOR);
}

export function downloadFile(data: string, name: string) {
  const url = URL.createObjectURL(new Blob([data]));

  const a: HTMLAnchorElement = (window as Window).document.createElement("a");
  a.href = url;
  a.download = name;

  a.click();

  URL.revokeObjectURL(url);
}
