import { Customer, prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const customers: Customer[] = await prisma.customer.findMany({
    where: { companyId: "odetail" },
  });

  if (!customers) {
    return notFound();
  }
  return NextResponse.json(customers);
}
