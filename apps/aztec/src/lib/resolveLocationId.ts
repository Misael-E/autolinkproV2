import { prisma } from "@repo/database";
import { COMPANY_ID } from "./constants";

export async function resolveLocationId(
  locationSlug?: string | null,
): Promise<string | null> {
  if (!locationSlug) return null;
  const location = await prisma.location.findFirst({
    where: { companyId: COMPANY_ID, slug: locationSlug, isActive: true },
  });
  return location?.id ?? null;
}
