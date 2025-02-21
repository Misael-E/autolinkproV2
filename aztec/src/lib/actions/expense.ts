"use server";

import { ExpenseSchema } from "../formValidationSchemas";
import prisma from "../prisma";

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
      },
      data: {
        description: data.description,
        cost: data.cost,
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
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
