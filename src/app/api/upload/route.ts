import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import os from "os";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided in request." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds 500MB limit." }, { status: 400 });
    }

    const timestamp = Date.now();
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${sanitizedOriginalName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucketName = "bolsover-media";
    let fileUrl = "";
    let uploadSuccess = false;

    // Attempt 1: Upload to Supabase Storage Bucket
    try {
      let { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filename, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true
        });

      // If bucket does not exist, try creating it automatically
      if (uploadError && (uploadError.message?.includes("Bucket not found") || (uploadError as any).statusCode === 404)) {
        await supabase.storage.createBucket(bucketName, { public: true });
        const retry = await supabase.storage.from(bucketName).upload(filename, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true
        });
        uploadError = retry.error;
      }

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
        if (urlData?.publicUrl) {
          fileUrl = urlData.publicUrl;
          uploadSuccess = true;
        }
      } else {
        console.warn("Supabase Storage upload warning:", uploadError.message);
      }
    } catch (sbErr: any) {
      console.warn("Supabase Storage exception:", sbErr.message);
    }

    // Fallback: If Supabase Storage bucket is not available, save locally / /tmp and serve via /api/uploads/
    if (!uploadSuccess) {
      let uploadsDir = join(process.cwd(), "public", "uploads");
      fileUrl = `/uploads/${filename}`;

      try {
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        await writeFile(join(uploadsDir, filename), buffer);
      } catch (fsErr) {
        uploadsDir = join(os.tmpdir(), "uploads");
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        await writeFile(join(uploadsDir, filename), buffer);
        fileUrl = `/api/uploads/${filename}`;
      }
    }

    const category = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "document";

    // Save metadata record into PostgreSQL via Prisma
    const dbAsset = await prisma.mediaAsset.upsert({
      where: { url: fileUrl },
      update: {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        category
      },
      create: {
        url: fileUrl,
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        category
      }
    });

    return NextResponse.json({
      success: true,
      file: dbAsset
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload file." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const files = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ success: false, error: "Filename required" }, { status: 400 });
    }

    const cleanFilename = filename.replace(/^.*\/bolsover-media\//, "").replace(/^\/uploads\//, "").replace(/^\/api\/uploads\//, "");
    const bucketName = "bolsover-media";

    try {
      await supabase.storage.from(bucketName).remove([cleanFilename]);
    } catch (e) {}

    await prisma.mediaAsset.deleteMany({
      where: {
        OR: [
          { filename: cleanFilename },
          { url: { contains: cleanFilename } }
        ]
      }
    });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
