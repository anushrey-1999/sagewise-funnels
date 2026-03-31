import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require";
import { assertSameOrigin } from "@/lib/admin/security";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

function assertSafeUploadPathname(pathname: string) {
  if (typeof pathname !== "string") throw new Error("Invalid upload pathname");
  if (!pathname.startsWith("adwall/")) throw new Error("Invalid upload pathname");
  if (pathname.startsWith("/")) throw new Error("Invalid upload pathname");
  if (pathname.includes("..")) throw new Error("Invalid upload pathname");
  if (pathname.length > 300) throw new Error("Invalid upload pathname");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    assertSameOrigin(req);
    const user = await requireAdmin(req, "client_editor");

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in your environment (Vercel Project Env Vars and local .env.dev).",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        assertSafeUploadPathname(pathname);
        return {
          allowedContentTypes: [...ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ adminUserId: user.id, pathname }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Upload completion is callback-driven (won't run on localhost without a tunnel).
        console.log("vercel_blob_upload_completed", { blob, tokenPayload });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("admin_blob_upload_token_error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}

