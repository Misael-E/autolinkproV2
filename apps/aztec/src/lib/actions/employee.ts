"use server";

import { EmployeeSchema } from "@repo/types";
import { Prisma, prisma } from "@repo/database";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; message: string };

// EMPLOYEE ACTIONS
export const createEmployee = async (
  currentState: CurrentState,
  data: EmployeeSchema
) => {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: [data.email],
      publicMetadata: { role: data.role },
    });

    await prisma.employee.create({
      data: {
        id: user.id,
        username: data.username,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        companyId: "aztec",
      },
    });

    // revalidatePath("/list/employees");
    return { success: true, message: "Employee created" };
  } catch (err: any) {
    if (err?.clerkError && Array.isArray(err.errors) && err.errors.length > 0) {
      return {
        success: false,
        message: err.errors[0].longMessage || err.errors[0].message,
      };
    }

    return {
      success: false,
      message:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
};

export const updateEmployee = async (
  currentState: CurrentState,
  data: EmployeeSchema
) => {
  if (!data.id) {
    return { success: false, message: "Employee does not exist" };
  }

  try {
    // const user = await clerkClient.users.updateUser(data.id, {
    //   username: data.username,
    //   ...(data.password !== "" && { password: data.password }),
    //   firstName: data.firstName,
    //   lastName: data.lastName,
    // });

    await prisma.employee.update({
      where: {
        id: data.id,
        companyId: "aztec",
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        role: data.role,
      },
    });
    // revalidatePath("/list/employees");
    return { success: true, message: "Successfully updated employee" };
  } catch (err: any) {
    if (err?.clerkError && Array.isArray(err.errors) && err.errors.length > 0) {
      return {
        success: false,
        message: err.errors[0].longMessage || err.errors[0].message,
      };
    }

    return {
      success: false,
      message:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
};

export const deleteEmployee = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.employee.delete({
      where: {
        id: id,
        companyId: "aztec",
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: "Successfully deleted Employee" };
  } catch (err: any) {
    if (err?.clerkError && Array.isArray(err.errors) && err.errors.length > 0) {
      return {
        success: false,
        message: err.errors[0].longMessage || err.errors[0].message,
      };
    }

    return {
      success: false,
      message:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
};
