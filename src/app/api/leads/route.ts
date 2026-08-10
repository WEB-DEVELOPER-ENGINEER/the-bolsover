import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

// GET /api/leads - Retrieve all leads (Protected Admin)
export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { interestType: { contains: q } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/leads - Submit public lead registration (Public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, interestType, message, sourceForm, customData } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }

    const leadName = name || email.split("@")[0];

    const lead = await prisma.lead.create({
      data: {
        name: leadName,
        email: email.trim().toLowerCase(),
        phone: phone || "",
        interestType: interestType || "General Enquiry",
        message: message || "",
        sourceForm: sourceForm || "Footer Registration",
        customData: typeof customData === "string" ? customData : JSON.stringify(customData || {}),
        status: "NEW"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully. A representative will contact you shortly.",
      leadId: lead.id
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/leads - Update lead status & notes (Protected Admin)
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes, name, email, phone, interestType } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID is required." }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (interestType !== undefined) dataToUpdate.interestType = interestType;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/leads - Delete a lead by ID (Protected Admin)
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID required" }, { status: 400 });
    }

    await prisma.lead.deleteMany({ where: { id } });

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
