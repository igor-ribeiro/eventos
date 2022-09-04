import { NextApiRequest, NextApiResponse } from "next";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { storage } from "@/server/storage";
import { env } from "@/env/server.mjs";
import { join } from "path";

export default async function uploadImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session) {
    res.redirect("/auth/signin");
    return;
  }

  const { fileName, type } = req.query as { fileName: string; type: string };

  // Get a v4 signed URL for reading the file
  const [uploadUrl] = await storage
    .bucket(env.GCLOUD_STORAGE_BUCKET)
    .file(fileName)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 1 * 60 * 1000, // 5 minutes
      contentType: type,
    });

  const fileUrl = new URL(env.GCLOUD_STORAGE_URL);
  fileUrl.pathname = join(env.GCLOUD_STORAGE_BUCKET, fileName);

  res.send({ uploadUrl, fileUrl: fileUrl.toString() });
}
