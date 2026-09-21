import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // maxFileCount defaults to 1 if not set — that's why multi-select uploads
  // in the admin product form were silently only taking the first file.
  productImage: f({ image: { maxFileSize: "8MB", maxFileCount: 6 } })
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

  categoryCover: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  // For the homepage carousel — a slide's cover can be a photo or a video.
  heroMedia: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  })
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
