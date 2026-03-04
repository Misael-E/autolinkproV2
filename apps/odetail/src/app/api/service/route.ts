import { prisma, ServiceCatalog } from "@repo/database";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const services: ServiceCatalog[] = await prisma.serviceCatalog.findMany({
    where: { companyId: "odetail" },
    orderBy: { createdAt: "desc" },
  });

  if (!services) {
    return notFound();
  }
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const { name } = await request.json();

  const existing = await prisma.serviceCatalog.findFirst({
    where: { name, companyId: "odetail" },
  });

  if (existing) {
    return Response.json(existing);
  }

  const newService = await prisma.serviceCatalog.create({
    data: { name, companyId: "odetail" },
  });

  return new Response(JSON.stringify(newService));
}

export async function PATCH(request: Request) {
  const { name, code, price } = await request.json();

  const updated = await prisma.serviceCatalog.updateMany({
    where: { name, companyId: "odetail" },
    data: {
      ...(code !== undefined && { code }),
      ...(price !== undefined && { price: parseFloat(price) }),
    },
  });

  return NextResponse.json(updated);
}
