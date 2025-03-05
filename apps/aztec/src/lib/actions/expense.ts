"use server";

import { ExpenseSchema } from "@repo/types";
import { prisma } from "@repo/database";

type CurrentState = { success: boolean; error: boolean };

// EXPENSE ACTIONS
export const createExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema
) => {
  try {
    await prisma.expense.create({
      data: {
        description: data.description,
        cost: data.cost,
        isRent: data.isRent,
        isWage: data.isWage,
        date: new Date(data.date),
        paymentType: data.paymentType,
        companyId: "aztec",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.expense.update({
      where: {
        id: data.id,
        companyId: "aztec",
      },
      data: {
        description: data.description,
        cost: data.cost,
        isRent: data.isRent,
        isWage: data.isWage,
        date: new Date(data.date),
        paymentType: data.paymentType,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExpense = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.expense.delete({
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
