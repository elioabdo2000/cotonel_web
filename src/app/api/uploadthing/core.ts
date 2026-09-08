import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "8MB" } })
    .middleware(async () => {
      // Runs server-side before the upload is allowed — checks the same
      // session cookie the /admin pages check, so this endpoint can't be
      // used by anyone who isn't logged in, even if they find the URL.
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  categoryCover: f({ image: { maxFileSize: "8MB" } })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
