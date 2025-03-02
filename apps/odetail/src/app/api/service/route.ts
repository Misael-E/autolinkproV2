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
