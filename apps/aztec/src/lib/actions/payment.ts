"use server";

import { PaymentSchema } from "@repo/types";
import { prisma } from "@repo/database";
import { resolveLocationId } from "../resolveLocationId";

type CurrentState = { success: boolean; error: boolean };

export const createPayment = async (
  currentState: CurrentState,
  data: PaymentSchema
) => {
  try {
    const locationId = await resolveLocationId(data.locationSlug);

    // Create a new Payment record linked to a Statement.
    await prisma.payment.create({
      data: {
        statementId: data.statementId as number,
        amount: data.amount,
        paymentType: data.paymentType,
        paymentDate: data.paymentDate,
        note: data.note,
        companyId: "aztec",
        locationId: locationId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating payment:", err);
    return { success: false, error: true };
  }
};

export const updatePayment = async (
  currentState: CurrentState,
  data: PaymentSchema
) => {
  if (!data.id || !data.statementId) {
    return { success: false, error: true };
  }

  try {
    const locationId = await resolveLocationId(data.locationSlug);

    await prisma.payment.update({
      where: { id: data.id, companyId: "aztec", locationId: locationId },
      data: {
        amount: data.amount,
        paymentType: data.paymentType,
        paymentDate: data.paymentDate,
        note: data.note,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating payment:", err);
    return { success: false, error: true };
  }
};

export const deletePayment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const locationSlug = data.get("locationSlug") as string;
  try {
    const locationId = await resolveLocationId(locationSlug);

    await prisma.payment.delete({
      where: { id: parseInt(id), companyId: "aztec", locationId: locationId },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting payment:", err);
    return { success: false, error: true };
  }
};
