import { prisma, ServiceCatalog } from "@repo/database";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { resolveLocationId } from "@/lib/resolveLocationId";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationSlug = searchParams.get("location") || "";
  const locationId = await resolveLocationId(locationSlug);

  const services: ServiceCatalog[] = await prisma.serviceCatalog.findMany({
    where: { companyId: "aztec", locationId: locationId },
    orderBy: { createdAt: "desc" },
  });

  if (!services) {
    return notFound();
  }
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationSlug = searchParams.get("location") || "";
  const locationId = await resolveLocationId(locationSlug);
  const { name } = await request.json();

  const existing = await prisma.serviceCatalog.findFirst({
    where: { name, companyId: "aztec", locationId: locationId },
  });

  if (existing) {
    return Response.json(existing);
  }

  const newService = await prisma.serviceCatalog.create({
    data: { name, companyId: "aztec", locationId: locationId },
  });

  return new Response(JSON.stringify(newService));
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationSlug = searchParams.get("location") || "";
  const locationId = await resolveLocationId(locationSlug);
  const { name, code, price } = await request.json();

  const updated = await prisma.serviceCatalog.updateMany({
    where: { name, companyId: "aztec", locationId },
    data: {
      ...(code !== undefined && { code }),
      ...(price !== undefined && { price: parseFloat(price) }),
    },
  });

  return NextResponse.json(updated);
}
