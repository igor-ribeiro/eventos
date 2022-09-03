import { env } from "@/env/server.mjs";
import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
  projectId: env.GCLOUD_PROJECT_ID,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  credentials: {
    client_email: env.GCLOUD_CLIENT_EMAIL,
    private_key: env.GCLOUD_CLIENT_KEY,
  },
});
