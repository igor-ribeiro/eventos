import { NextApiRequest, NextApiResponse } from "next";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession as getServerSession } from "next-auth";
import formidable from "formidable";
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
  console.log("update image");
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

  try {
    const [uploaded] = await storage
      .bucket("ribeirolabs-events")
      .upload(file.filepath, {
        destination: `images/${file.newFilename}.${ext}`,
      });

    res.send({ url: uploaded.metadata.mediaLink });
  } catch (e) {
    res.status(500).send({
      e,
    });
  }
}
