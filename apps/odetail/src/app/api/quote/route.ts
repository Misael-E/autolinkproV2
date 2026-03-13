import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search") || "";

  const quotes = await prisma.quote.findMany({
    where: {
      companyId: "odetail",
      OR: [
        { quoteNumber: { contains: query, mode: "insensitive" } },
        { customer: { firstName: { contains: query, mode: "insensitive" } } },
        { customer: { lastName: { contains: query, mode: "insensitive" } } },
        { customer: { phone: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      customer: true,
      services: true,
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(quotes);
}
