import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

// GET /api/form-builder - Get all form fields (Public returns enabled; Admin returns all)
export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    
    const fields = await prisma.formField.findMany({
      where: admin ? undefined : { enabled: true },
      orderBy: { order: "asc" }
    });

    const formatted = fields.map((f: any) => ({
      ...f,
      options: typeof f.options === "string" ? JSON.parse(f.options || "[]") : (f.options || [])
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/form-builder - Create a new custom form field (Protected Admin)
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { label, name, type, placeholder, required, options, enabled } = body;

    if (!label || !name) {
      return NextResponse.json({ success: false, error: "Field label and unique key name are required." }, { status: 400 });
    }

    // Clean key name
    const fieldName = name.trim().replace(/[^a-zA-Z0-9_]/g, "_");

    // Get current max order
    const count = await prisma.formField.count();

    const newField = await prisma.formField.create({
      data: {
        name: fieldName,
        label,
        type: type || "text",
        placeholder: placeholder || "",
        required: Boolean(required),
        options: Array.isArray(options) ? JSON.stringify(options) : (options || "[]"),
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        order: count
      }
    });

    const formatted = {
      ...newField,
      options: typeof newField.options === "string" ? JSON.parse(newField.options || "[]") : (newField.options || [])
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/form-builder - Update form field or reorder fields (Protected Admin)
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();

    // Check bulk reorder action
    if (body.action === "reorder" && Array.isArray(body.items)) {
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        await prisma.formField.update({
          where: { id: item.id },
          data: { order: i }
        });
      }

      const updatedFields = await prisma.formField.findMany({
        orderBy: { order: "asc" }
      });
      const formatted = updatedFields.map((f: any) => ({
        ...f,
        options: typeof f.options === "string" ? JSON.parse(f.options || "[]") : (f.options || [])
      }));

      return NextResponse.json({ success: true, data: formatted });
    }

    // Individual field update
    const { id, options, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Field ID is required" }, { status: 400 });
    }

    const dataToUpdate: any = { ...updateData };
    if (options !== undefined) {
      dataToUpdate.options = Array.isArray(options) ? JSON.stringify(options) : options;
    }

    const updatedField = await prisma.formField.update({
      where: { id },
      data: dataToUpdate
    });

    const formatted = {
      ...updatedField,
      options: typeof updatedField.options === "string" ? JSON.parse(updatedField.options || "[]") : (updatedField.options || [])
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/form-builder - Delete a form field (Protected Admin)
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Field ID required" }, { status: 400 });
    }

    await prisma.formField.deleteMany({ where: { id } });

    return NextResponse.json({ success: true, message: "Form field deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
