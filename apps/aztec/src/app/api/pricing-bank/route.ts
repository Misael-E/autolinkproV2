import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { code, distributor, customerType, flatCharge, location } = await req.json();
  if (!code || !customerType || flatCharge == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const locationRecord = location
      ? await prisma.location.findFirst({
          where: { companyId: "aztec", slug: location, isActive: true },
        })
      : null;

    await prisma.pricingBankEntry.upsert({
      where: {
        companyId_code_distributor_customerType: {
          companyId: "aztec",
          code,
          distributor: distributor ?? null,
          customerType,
        },
      },
      update: { flatCharge },
      create: {
        companyId: "aztec",
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
  const location = searchParams.get("location");

  if (!code || !supplier || !customerType) {
    return NextResponse.json(null);
  }

  try {
    const locationRecord = location
      ? await prisma.location.findFirst({
          where: { companyId: "aztec", slug: location, isActive: true },
        })
      : null;

    const baseWhere = {
      companyId: "aztec",
      locationId: locationRecord?.id ?? undefined,
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
          companyId: "aztec",
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
