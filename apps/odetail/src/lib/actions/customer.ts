"use server";

import { CustomerSchema } from "@repo/types";
import { prisma } from "@repo/database";

type CurrentState = { success: boolean; error: boolean };

// CUSTOMER ACTIONS
export const createCustomer = async (
  currentState: CurrentState,
  data: CustomerSchema
) => {
  try {
    await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        postalCode: data.postalCode,
        streetAddress1: data.streetAddress1,
        streetAddress2: data.streetAddress2,
        notes: data.notes,
        subscription: data.subscriptionWarranty,
        returnCounter: data.returnCounter,
        city: data.city,
        email: data.email,
        companyId: "odetail",
      },
    });

    // revalidatePath("/list/customers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateCustomer = async (
  currentState: CurrentState,
  data: CustomerSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.customer.update({
      where: {
        id: data.id,
        companyId: "odetail",
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        postalCode: data.postalCode,
        streetAddress1: data.streetAddress1,
        streetAddress2: data.streetAddress2,
        notes: data.notes,
        subscription: data.subscriptionWarranty,
        returnCounter: data.returnCounter,
        city: data.city,
        email: data.email,
        updatedAt: new Date(),
      },
    });
    // revalidatePath("/list/customers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteCustomer = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.customer.delete({
      where: {
        id: id,
        companyId: "odetail",
      },
    });

    // revalidatePath("/list/customers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
