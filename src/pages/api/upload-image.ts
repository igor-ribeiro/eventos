import { NextApiRequest, NextApiResponse } from "next";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession as getServerSession } from "next-auth";
import formidable from "formidable";
import FormData from "form-data";
import { createReadStream } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function uploadImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session) {
    res.redirect("/auth/signin");
    return;
  }

  const form = new formidable.IncomingForm();

  const file = await new Promise<formidable.File>((resolve, reject) => {
    form.parse(req, (error, _fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(files.file as formidable.File);
    });
  });

  const data = new FormData();

  data.append("action", "upload");
  data.append("key", "6d207e02198a847aa98d0a2a901485a5");
  data.append("source", createReadStream(file.filepath));

  const response = await (
    await fetch("https://freeimage.host/api/1/upload", {
      method: "post",
      body: data as any,
    })
  ).json();

  res.send({ url: response.image.display_url });
}
