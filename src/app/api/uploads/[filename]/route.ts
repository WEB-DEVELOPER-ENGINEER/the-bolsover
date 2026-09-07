import { NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import { join } from "path";
import os from "os";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    const tmpPath = join(os.tmpdir(), "uploads", filename);
    const altTmpPath = join("/tmp", "uploads", filename);
    const publicPath = join(process.cwd(), "public", "uploads", filename);

    const filePath = existsSync(tmpPath)
      ? tmpPath
      : existsSync(altTmpPath)
      ? altTmpPath
      : existsSync(publicPath)
      ? publicPath
      : null;

    if (!filePath) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;

    const ext = filename.split(".").pop()?.toLowerCase();
    const MIME_MAP: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      avif: "image/avif",
      svg: "image/svg+xml",
      gif: "image/gif",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      pdf: "application/pdf",
    };
    const contentType = (ext && MIME_MAP[ext]) || "application/octet-stream";

    const range = request.headers.get("range");

    if (range && contentType.startsWith("video/")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const fileStream = createReadStream(filePath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        }
      });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    const fileStream = createReadStream(filePath);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      }
    });

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
