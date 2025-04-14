"use server";

import { ServiceCatalogSchema } from "@repo/types";
import { prisma } from "@repo/database";

type CurrentState = { success: boolean; error: boolean };

export const createServiceCatalog = async (
  currentState: CurrentState,
  data: ServiceCatalogSchema
) => {
  try {
    await prisma.serviceCatalog.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        createdAt: new Date(),
        companyId: "aztec",
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
    await prisma.serviceCatalog.update({
      where: {
        id: data.id,
        companyId: "aztec",
      },
      data: {
        name: data.name,
        description: data.description,
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
  try {
    await prisma.serviceCatalog.delete({
      where: {
        id: parseInt(id),
        companyId: "aztec",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
