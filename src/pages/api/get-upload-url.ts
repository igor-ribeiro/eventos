import { NextApiRequest, NextApiResponse } from "next";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession as getServerSession } from "next-auth";
import formidable from "formidable";
import { storage } from "@/server/storage";

export default async function uploadImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session) {
    res.redirect("/auth/signin");
    return;
  }

  const { fileName } = req.query as { fileName: string };

  // Get a v4 signed URL for reading the file
  const [url] = await storage
    .bucket("ribeirolabs-events")
    .file("images/" + fileName)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 1 * 60 * 1000, // 5 minutes
      contentType: "multipart/form-data",
    });

  res.send({ url });
}
