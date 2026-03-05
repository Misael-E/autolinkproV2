"use server";

import { ServiceCatalogSchema } from "@repo/types";
import { prisma } from "@repo/database";
import { resolveLocationId } from "../resolveLocationId";

type CurrentState = { success: boolean; error: boolean };

export const createServiceCatalog = async (
  currentState: CurrentState,
  data: ServiceCatalogSchema
) => {
  try {
    const locationId = await resolveLocationId(data.locationSlug);

    await prisma.serviceCatalog.create({
      data: {
        name: data.name,
        description: data.description,
        code: data.code,
        price: data.price,
        createdAt: new Date(),
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

export const updateServiceCatalog = async (
  currentState: CurrentState,
  data: ServiceCatalogSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    const locationId = await resolveLocationId(data.locationSlug);

    await prisma.serviceCatalog.update({
      where: {
        id: data.id,
        companyId: "aztec",
        locationId: locationId,
      },
      data: {
        name: data.name,
        description: data.description,
        code: data.code,
        price: data.price,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteServiceCatalog = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const locationSlug = data.get("locationSlug") as string;
  try {
    const locationId = await resolveLocationId(locationSlug);

    await prisma.serviceCatalog.delete({
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
