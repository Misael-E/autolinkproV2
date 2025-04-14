import { prisma, ServiceCatalog } from "@repo/database";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const services: ServiceCatalog[] = await prisma.serviceCatalog.findMany({
    where: { companyId: "aztec" },
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
    where: { name, companyId: "aztec" },
  });

  if (existing) {
    return Response.json(existing);
  }

  const newService = await prisma.serviceCatalog.create({
    data: { name, companyId: "aztec" },
  });

  return new Response(JSON.stringify(newService));
}
