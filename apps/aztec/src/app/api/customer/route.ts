import { resolveLocationId } from "@/lib/resolveLocationId";
import { Customer, prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search") || "";
  const locationSlug = searchParams.get("location") || "";
  const locationId = await resolveLocationId(locationSlug);

  const customers: Customer[] = await prisma.customer.findMany({
    where: {
      companyId: "aztec",
      locationId: locationId,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!customers) {
    return notFound();
  }
  return NextResponse.json(customers);
}
