import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

// GET /api/floor-plans - Get all floor levels ordered by sequence position (Public)
export async function GET() {
  try {
    const rawFloors = await prisma.floorLevel.findMany({
      orderBy: { order: "asc" }
    });

    const floorLevels = rawFloors.map((fl: any) => ({
      ...fl,
      subUnits: typeof fl.subUnits === "string" ? JSON.parse(fl.subUnits || "[]") : (fl.subUnits || [])
    }));

    return NextResponse.json({ success: true, data: floorLevels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/floor-plans - Create a new floor level (Protected Admin)
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const {
      floorCode,
      title,
      subtitle,
      unitsRange,
      residenceCount,
      areaSqFtRange,
      areaSqMRange,
      highlight,
      description,
      masterImage,
      subUnits
    } = body;

    // Get current max order
    const maxOrderFloor = await prisma.floorLevel.findFirst({
      orderBy: { order: "desc" }
    });
    const nextOrder = body.order !== undefined ? Number(body.order) : (maxOrderFloor ? maxOrderFloor.order + 1 : 0);

    const subUnitsStr = Array.isArray(subUnits) ? JSON.stringify(subUnits) : (subUnits || "[]");

    const newFloor = await prisma.floorLevel.create({
      data: {
        floorCode: floorCode || "NEW",
        title: title || "New Floor Level",
        subtitle: subtitle || "",
        levelIndex: nextOrder,
        unitsRange: unitsRange || "Apartments",
        residenceCount: Number(residenceCount) || 1,
        areaSqFtRange: areaSqFtRange || "500 - 1,000 sq ft",
        areaSqMRange: areaSqMRange || "45.0 - 92.0 sq m",
        highlight: highlight || "Architectural feature",
        description: description || "Floor level details",
        masterImage: masterImage || "https://jaiybxlzrdnofevtlwrg.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
        order: nextOrder,
        subUnits: subUnitsStr
      }
    });

    const formatted = {
      ...newFloor,
      subUnits: JSON.parse(newFloor.subUnits || "[]")
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/floor-plans - Update an existing floor level or reorder floor sequence (Protected Admin)
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();

    // Check if reordering bulk request
    if (body.action === "reorder" && Array.isArray(body.items)) {
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        await prisma.floorLevel.update({
          where: { id: item.id },
          data: {
            order: i,
            levelIndex: i
          }
        });
      }
      const updatedFloors = await prisma.floorLevel.findMany({
        orderBy: { order: "asc" }
      });
      const formatted = updatedFloors.map((fl: any) => ({
        ...fl,
        subUnits: typeof fl.subUnits === "string" ? JSON.parse(fl.subUnits || "[]") : (fl.subUnits || [])
      }));
      return NextResponse.json({ success: true, data: formatted });
    }

    // Individual update request
    const { id, subUnits, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Floor ID is required" }, { status: 400 });
    }

    const dataToUpdate: any = { ...updateData };
    if (subUnits !== undefined) {
      dataToUpdate.subUnits = Array.isArray(subUnits) ? JSON.stringify(subUnits) : subUnits;
    }
    if (updateData.residenceCount !== undefined) {
      dataToUpdate.residenceCount = Number(updateData.residenceCount);
    }
    if (updateData.order !== undefined) {
      dataToUpdate.order = Number(updateData.order);
      dataToUpdate.levelIndex = Number(updateData.order);
    }

    const updatedFloor = await prisma.floorLevel.update({
      where: { id },
      data: dataToUpdate
    });

    const formatted = {
      ...updatedFloor,
      subUnits: typeof updatedFloor.subUnits === "string" ? JSON.parse(updatedFloor.subUnits || "[]") : (updatedFloor.subUnits || [])
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/floor-plans - Delete a floor level by ID (Protected Admin)
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }
    const url = new URL(request.url);
    let id = url.searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Floor ID is required" }, { status: 400 });
    }

    await prisma.floorLevel.delete({
      where: { id }
    });

    // Re-index remaining floors so orders remain 0, 1, 2...
    const remaining = await prisma.floorLevel.findMany({
      orderBy: { order: "asc" }
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.floorLevel.update({
        where: { id: remaining[i].id },
        data: { order: i, levelIndex: i }
      });
    }

    const updatedFloors = await prisma.floorLevel.findMany({
      orderBy: { order: "asc" }
    });

    const formatted = updatedFloors.map((fl: any) => ({
      ...fl,
      subUnits: typeof fl.subUnits === "string" ? JSON.parse(fl.subUnits || "[]") : (fl.subUnits || [])
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
