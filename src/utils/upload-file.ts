import { env } from "@/env/client.mjs";

export const uploadFile = async (file: File) => {
  const extRegex = /\.(\w+)$/.exec(file.name);

  if (extRegex == null) {
    throw new Error("INVALID_FILE");
  }

  const ext = extRegex[0];

  const fileName = crypto.randomUUID() + ext;

  const query = new URLSearchParams([
    ["fileName", fileName],
    ["type", file.type],
  ]);

  try {
    const {
      uploadUrl,
      fileUrl,
    }: {
      uploadUrl: string;
      fileUrl: string;
    } = await (await fetch(`/api/get-upload-url?${query.toString()}`)).json();

    try {
      await new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      return fileUrl;
    } catch (e) {
      console.error(e);
      throw new Error("UPLOAD_ERROR");
    }
  } catch (e) {
    console.error(e);
    throw new Error("SIGNED_URL_ERROR");
  }
};
