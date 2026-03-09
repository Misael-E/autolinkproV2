import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { code, distributor, customerType, flatCharge } = await req.json();
  if (!code || !customerType || flatCharge == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
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
      update: { flatCharge },
      create: {
        companyId: "odetail",
        code,
        distributor: distributor ?? null,
        customerType,
        flatCharge,
      },
    });
    return NextResponse.json({ flatCharge });
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

    const [fromInvoice, fromQuote] = await Promise.all([
      prisma.service.findFirst({
        where: {
          ...baseWhere,
          invoiceId: { not: null },
          invoice: { customer: { customerType } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.service.findFirst({
        where: {
          ...baseWhere,
          quoteId: { not: null },
          quote: { customer: { customerType } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const candidates = [fromInvoice, fromQuote].filter(Boolean);
    const service = candidates.sort(
      (a, b) => b!.updatedAt.getTime() - a!.updatedAt.getTime(),
    )[0];

    if (!service) {
      return NextResponse.json(null);
    }

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

    const cost = service.price;
    const flatCharge = bankEntry?.flatCharge ?? 0;
    const finalPrice = cost + flatCharge;

    return NextResponse.json({
      price: finalPrice,
      materialCost: service.materialCost,
      gasCost: service.gasCost,
      shopFees: service.shopFees,
      distributor: service.distributor,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
