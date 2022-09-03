import { NextApiRequest, NextApiResponse } from "next";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession as getServerSession } from "next-auth";
import formidable from "formidable";
import FormData from "form-data";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";
import { storage } from "@/server/storage";

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

  const [_name, ext] = file.originalFilename!.split(".");

  const data = new FormData();

  data.append("action", "upload");
  data.append("key", "6d207e02198a847aa98d0a2a901485a5");
  data.append("source", createReadStream(file.filepath));

  const [uploaded] = await storage
    .bucket("ribeirolabs-events")
    .upload(file.filepath, {
      destination: `images/${file.newFilename}.${ext}`,
    });

  res.send({ url: uploaded.metadata.mediaLink });
}
