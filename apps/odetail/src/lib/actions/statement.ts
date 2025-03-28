"use server";

import { StatementSchema } from "@repo/types";
import { prisma } from "@repo/database";

type CurrentState = { success: boolean; error: boolean };

export const createStatement = async (
  currentState: CurrentState,
  data: StatementSchema
) => {
  try {
    const totals = await prisma.revenue.aggregate({
      where: {
        service: {
          distributor: data.distributor,
          createdAt: {
            gte: new Date(data.startDate),
            lte: new Date(data.endDate),
          },
        },
        companyId: "odetail",
      },
      _sum: {
        grossSalesGst: true,
        costBeforeGst: true,
        costAfterGst: true,
      },
      orderBy: {
        invoiceId: "asc",
      },
    });

    const newStatement = await prisma.statement.create({
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        amountPaid: data.amountPaid,
        grossSalesGst: totals._sum.grossSalesGst,
        costBeforeGst: totals._sum.costBeforeGst,
        costAfterGst: totals._sum.costAfterGst,
        distributor: data.distributor,
        createdAt: new Date(),
        companyId: "odetail",
      },
    });

    // Update revenue records that match the criteria to reference the new statement.
    await prisma.revenue.updateMany({
      where: {
        service: {
          distributor: data.distributor,
          createdAt: {
            gte: new Date(data.startDate),
            lte: new Date(data.endDate),
          },
        },
        companyId: "odetail",
      },
      data: {
        statementId: newStatement.id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStatement = async (
  currentState: CurrentState,
  data: StatementSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  const totals = await prisma.revenue.aggregate({
    where: {
      service: {
        distributor: data.distributor,
        createdAt: {
          gte: new Date(data.startDate),
          lte: new Date(data.endDate),
        },
      },
      companyId: "odetail",
    },
    _sum: {
      grossSalesGst: true,
      costBeforeGst: true,
      costAfterGst: true,
    },
    orderBy: {
      invoiceId: "asc",
    },
  });

  try {
    await prisma.statement.update({
      where: {
        id: data.id,
        companyId: "odetail",
      },
      data: {
        amountPaid: data.amountPaid,
        grossSalesGst: totals._sum.grossSalesGst,
        costBeforeGst: totals._sum.costBeforeGst,
        costAfterGst: totals._sum.costAfterGst,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        updatedAt: new Date(),
      },
    });

    // First, clear revenues previously associated with this statement that no longer match the updated date range.
    await prisma.revenue.updateMany({
      where: {
        statementId: data.id,
        OR: [
          {
            service: {
              distributor: data.distributor,
              createdAt: { lt: new Date(data.startDate) },
            },
          },
          {
            service: {
              distributor: data.distributor,
              createdAt: { gt: new Date(data.endDate) },
            },
          },
        ],
      },
      data: { statementId: null },
    });

    // Next, update revenues that now fall within the updated date range to reference this statement.
    await prisma.revenue.updateMany({
      where: {
        service: {
          distributor: data.distributor,
          createdAt: {
            gte: new Date(data.startDate),
            lte: new Date(data.endDate),
          },
        },
        companyId: "odetail",
      },
      data: { statementId: data.id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStatement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.statement.delete({
      where: {
        id: parseInt(id),
        companyId: "odetail",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
