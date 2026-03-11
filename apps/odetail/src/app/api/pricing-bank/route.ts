import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { code, distributor, customerType, flatCharge, glassCost } = await req.json();
  if (!code || !customerType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (flatCharge != null) updateData.flatCharge = flatCharge;
  if (glassCost != null) updateData.glassCost = glassCost;

  try {
    await prisma.pricingBankEntry.upsert({
      where: {
        companyId_code_distributor_customerType: {
          companyId: "odetail",
          code,
          distributor: distributor ?? null,
          customerType,
        },
      },
      update: updateData,
      create: {
        companyId: "odetail",
        code,
        distributor: distributor ?? null,
        customerType,
        flatCharge: flatCharge ?? 0,
        glassCost: glassCost ?? 0,
      },
    });
    return NextResponse.json({ flatCharge, glassCost });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const supplier = searchParams.get("supplier");
  const customerType = searchParams.get("customerType");

  if (!code || !supplier || !customerType) {
    return NextResponse.json(null);
  }

  try {
    const baseWhere = {
      companyId: "odetail",
      code: { equals: code, mode: "insensitive" as const },
      distributor: { equals: supplier, mode: "insensitive" as const },
    };

    const bankEntry = await prisma.pricingBankEntry.findUnique({
      where: {
        companyId_code_distributor_customerType: {
          companyId: "odetail",
          code,
          distributor: supplier,
          customerType,
        },
      },
    });

    const [revenueEntry, feeSource] = await Promise.all([
      // Glass cost: from the most recent Revenue record linked to a matching invoice service
      prisma.revenue.findFirst({
        where: {
          service: {
            ...baseWhere,
            invoiceId: { not: null },
            invoice: { customer: { customerType } },
          },
          costBeforeGst: { not: null },
        },
        orderBy: { updatedAt: "desc" },
      }),
      // Fees: from the most recent service (invoice or quote)
      prisma.service.findFirst({
        where: {
          ...baseWhere,
          OR: [
            { invoiceId: { not: null }, invoice: { customer: { customerType } } },
            { quoteId: { not: null }, quote: { customer: { customerType } } },
          ],
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    if (!revenueEntry && !feeSource && !bankEntry) {
      return NextResponse.json(null);
    }

    const flatCharge = bankEntry?.flatCharge ?? 0;
    const bankGlassCost = (bankEntry as any)?.glassCost;
    const glassCost =
      bankGlassCost != null && bankGlassCost > 0
        ? bankGlassCost
        : (revenueEntry?.costBeforeGst ?? 0);

    return NextResponse.json({
      flatCharge,
      glassCost,
      materialCost: feeSource?.materialCost,
      gasCost: feeSource?.gasCost,
      shopFees: feeSource?.shopFees,
      distributor: feeSource?.distributor,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
