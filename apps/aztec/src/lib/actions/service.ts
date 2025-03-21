"use server";

import { prisma } from "@repo/database";

type CurrentState = { success: boolean; error: boolean };

export const deleteService = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.service.delete({
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
