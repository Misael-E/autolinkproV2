import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { COMPANY_ID } from "./constants";

export async function resolveLocation(locationSlug: string) {
  if (!locationSlug) notFound();

  const location = await prisma.location.findFirst({
    where: {
      companyId: COMPANY_ID,
      slug: locationSlug,
      isActive: true,
    },
  });

  if (!location) notFound();
  return location;
}
