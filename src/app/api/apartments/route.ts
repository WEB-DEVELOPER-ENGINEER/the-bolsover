import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function seedDefaultApartments() {
  const defaultApartments = Array.from({ length: 24 }, (_, index) => {
    const number = index + 1;
    const formattedNumber = String(number).padStart(2, "0");

    return {
      number,
      label: `Apartment ${formattedNumber}`,
      residenceType: "Luxury Residence",
      area: "",
      floor: "",
      description: "",
      slides: "[]",
      order: number
    };
  });

  await prisma.apartment.createMany({
    data: defaultApartments,
    skipDuplicates: true
  });
}

// GET /api/apartments - Fetch all apartments (Public)
export async function GET() {
  try {
    let count = await prisma.apartment.count();
    if (count === 0) {
      await seedDefaultApartments();
    }

    const rawApartments = await prisma.apartment.findMany({
      orderBy: { number: "asc" }
    });

    const formatted = rawApartments.map((apt: any) => ({
      ...apt,
      slides: typeof apt.slides === "string" ? JSON.parse(apt.slides || "[]") : (apt.slides || [])
    }));

    return NextResponse.json({ success: true, data: formatted }, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/apartments - Create new apartment (Protected Admin)
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { number, label, residenceType, area, floor, description, slides } = body;

    if (!number) {
      return NextResponse.json({ success: false, error: "Apartment number is required" }, { status: 400 });
    }

    const formattedNumber = String(number).padStart(2, "0");
    const slidesStr = Array.isArray(slides) ? JSON.stringify(slides) : (typeof slides === "string" ? slides : "[]");

    const newApartment = await prisma.apartment.create({
      data: {
        number: Number(number),
        label: label || `Apartment ${formattedNumber}`,
        residenceType: residenceType || "",
        area: area || "",
        floor: floor || "",
        description: description || "",
        slides: slidesStr,
        order: Number(number)
      }
    });

    const formatted = {
      ...newApartment,
      slides: JSON.parse(newApartment.slides || "[]")
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/apartments - Update an existing apartment (Protected Admin)
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { id, number, label, residenceType, area, floor, description, slides, order } = body;

    if (!id && !number) {
      return NextResponse.json({ success: false, error: "Apartment ID or number is required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (label !== undefined) dataToUpdate.label = label;
    if (residenceType !== undefined) dataToUpdate.residenceType = residenceType;
    if (area !== undefined) dataToUpdate.area = area;
    if (floor !== undefined) dataToUpdate.floor = floor;
    if (description !== undefined) dataToUpdate.description = description;
    if (order !== undefined) dataToUpdate.order = Number(order);
    if (slides !== undefined) {
      dataToUpdate.slides = Array.isArray(slides) ? JSON.stringify(slides) : slides;
    }

    let updated;
    if (id) {
      updated = await prisma.apartment.update({
        where: { id },
        data: dataToUpdate
      });
    } else {
      updated = await prisma.apartment.update({
        where: { number: Number(number) },
        data: dataToUpdate
      });
    }

    const formatted = {
      ...updated,
      slides: typeof updated.slides === "string" ? JSON.parse(updated.slides || "[]") : (updated.slides || [])
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/apartments - Delete an apartment by ID or number (Protected Admin)
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    let number = url.searchParams.get("number");

    if (!id && !number) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      number = body.number;
    }

    if (id) {
      await prisma.apartment.delete({ where: { id } });
    } else if (number) {
      await prisma.apartment.delete({ where: { number: Number(number) } });
    } else {
      return NextResponse.json({ success: false, error: "Apartment ID or number is required" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Apartment deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
