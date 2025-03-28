"use server";

import { PaymentSchema } from "@repo/types";
import { prisma } from "@repo/database";

type CurrentState = { success: boolean; error: boolean };

export const createPayment = async (
  currentState: CurrentState,
  data: PaymentSchema
) => {
  try {
    // Create a new Payment record linked to a Statement.
    const payment = await prisma.payment.create({
      data: {
        statementId: data.statementId as number,
        amount: data.amount,
        paymentType: data.paymentType,
        note: data.note,
        companyId: "aztec",
      },
    });

    return { success: true, error: false, data: payment };
  } catch (err) {
    console.error("Error creating payment:", err);
    return { success: false, error: true };
  }
};

export const updatePayment = async (data: PaymentSchema) => {
  if (!data.id || !data.statementId) {
    return { success: false, error: true };
  }

  try {
    await prisma.payment.update({
      where: { id: data.id, companyId: "aztec" },
      data: {
        amount: data.amount,
        paymentType: data.paymentType,
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
  try {
    await prisma.payment.delete({
      where: { id: parseInt(id), companyId: "aztec" },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting payment:", err);
    return { success: false, error: true };
  }
};
