"use server";

import { prisma } from "@repo/database";
import { resolveLocationId } from "../resolveLocationId";

type CurrentState = { success: boolean; error: boolean };

export const deleteService = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const locationSlug = data.get("locationSlug") as string;
  try {
    const locationId = await resolveLocationId(locationSlug);

    await prisma.service.delete({
      where: {
        id: parseInt(id),
        companyId: "aztec",
        locationId: locationId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
