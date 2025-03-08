"use server";

import { RevenueSchema } from "@repo/types";
import { prisma } from "@repo/database";
import { calculateInvoiceTotals } from "../util";

type CurrentState = { success: boolean; error: boolean };

export const createRevenue = async (invoiceId: number) => {
  try {
    if (!invoiceId) {
      return { success: false, error: true };
    }

    console.log(`Processing revenue for Invoice ID: ${invoiceId}`);

    await prisma.$transaction(async (prisma) => {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId, companyId: "aztec" },
        select: {
          status: true,
          paymentType: true,
          services: true,
          createdAt: true,
        },
      });

      if (!invoice) return;

      const { status, paymentType, services, createdAt } = invoice;

      // Use flatMap() to create multiple revenue records at once
      const revenueData = services.flatMap((service) => {
        const { subtotal, gst, total } = calculateInvoiceTotals([service]);
        const totalPaid = parseFloat(subtotal);

        // console.log(
        //   `Raw Subtotal: ${subtotal}, Raw GST: ${gst}, Raw Total: ${total}`
        // );
        // console.log(`Subtotal: ${subtotal}, GST: ${gst}, Total: ${total}`);
        return {
          serviceId: service.id,
          createdAt: createdAt,
          updatedAt: new Date(),
          materialCost: parseFloat(service.materialCost ?? "0"),
          shopFees: parseFloat(service.shopFees ?? "0"),
          gasCost: parseFloat(service.gasCost ?? "0"),

          // Financial Breakdown
          grossSales: totalPaid,
          grossSalesGst: parseFloat(gst),

          // Service Breakdown
          totalWindshields:
            service.serviceType === "Windshield" ? service.quantity : 0,
          totalChipRepairs:
            service.serviceType === "ChipSubscription" ? service.quantity : 0,
          totalWarranties:
            service.serviceType === "Warranty" ? service.quantity : 0,

          // Payment Method Breakdown
          visa: paymentType === "Visa" ? totalPaid : 0,
          mastercard: paymentType === "Mastercard" ? totalPaid : 0,
          debit: paymentType === "Debit" ? totalPaid : 0,
          cash: paymentType === "Cash" ? totalPaid : 0,
          etransfer: paymentType === "ETransfer" ? totalPaid : 0,
          amex: paymentType === "Amex" ? totalPaid : 0,
          companyId: "aztec",
        };
      });

      // Insert all revenue records in a single Prisma call
      await prisma.revenue.createMany({
        data: revenueData,
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating revenue:", err);
    return { success: false, error: true };
  }
};

export const updateRevenue = async (
  currentState: CurrentState,
  data: RevenueSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.service.update({
        where: { id: data.serviceId, companyId: "aztec" },
        data: {
          distributor: data.distributor,
          materialCost: data.materialCost?.toString(),
          shopFees: data.shopFees?.toString(),
          updatedAt: new Date(),
        },
      });

      // Calculate windshield cost after gst
      const afterGst = data.costBeforeGst * 1.05;

      // console.log(
      //   `Gross Sales: ${data.grossSales}, Glass Cost: ${data.costBeforeGst}, Material Cost: ${data.materialCost}, Gas Cost: ${data.gasCost}`
      // );

      const jobNet =
        data.grossSales - data.costBeforeGst - data.materialCost - data.gasCost;

      const subNet = data.grossSales - data.costBeforeGst - data.materialCost;

      await prisma.revenue.update({
        where: {
          id: data.id,
          companyId: "aztec",
        },
        data: {
          costBeforeGst: data.costBeforeGst,
          costAfterGst: afterGst,
          materialCost: data.materialCost,
          jobNet: jobNet,
          subNet: subNet,
          trueNet: subNet,
          shopFees: data.shopFees,
          updatedAt: new Date(),
        },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteRevenue = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.revenue.delete({
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
