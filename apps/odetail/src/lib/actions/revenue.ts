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
        where: { id: invoiceId, companyId: "odetail" },
        select: {
          status: true,
          paymentType: true,
          services: true,
          createdAt: true,
          customer: { select: { customerType: true } },
        },
      });

      if (!invoice) return;

      const { status, paymentType, services, createdAt, customer } = invoice;

      // Build revenue records, looking up glass cost from pricing bank per service
      const revenueData = await Promise.all(
        services.map(async (service) => {
          const { subtotal, gst, total } = calculateInvoiceTotals([service]);
          const totalPaid = parseFloat(subtotal);

          // Look up glass cost from pricing bank
          let costBeforeGst: number | null = null;
          if (service.code && service.distributor && customer?.customerType) {
            const bankEntry = await prisma.pricingBankEntry.findUnique({
              where: {
                companyId_code_distributor_customerType: {
                  companyId: "odetail",
                  code: service.code,
                  distributor: service.distributor,
                  customerType: customer.customerType,
                },
              },
            });
            if (bankEntry?.glassCost && bankEntry.glassCost > 0) {
              costBeforeGst = Math.round(bankEntry.glassCost);
            }
          }

          const costAfterGst = costBeforeGst != null ? costBeforeGst * 1.05 : null;
          const materialCost = parseFloat(service.materialCost ?? "0");
          const shopFees = parseFloat(service.shopFees ?? "0");

          return {
            serviceId: service.id,
            invoiceId: invoiceId,
            createdAt: createdAt,
            updatedAt: new Date(),
            materialCost: Math.round(materialCost),
            shopFees: shopFees,
            gasCost: parseFloat(service.gasCost ?? "0"),
            costBeforeGst: costBeforeGst,
            costAfterGst: costAfterGst,

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
            companyId: "odetail",
          };
        })
      );

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
      if (data.serviceId) {
        await prisma.service.update({
          where: { id: data.serviceId, companyId: "odetail" },
          data: {
            distributor: data.distributor,
            materialCost: data.materialCost?.toString(),
            shopFees: data.shopFees?.toString(),
            updatedAt: new Date(),
          },
        });
      }

      // Calculate windshield cost after gst
      const costBeforeGst = Math.round(data.costBeforeGst);
      const afterGst = costBeforeGst * 1.05;

      const materialCost = Math.round(data.materialCost ?? 0);
      const shopFees = data.shopFees ?? 0;

      const jobNet = data.grossSales - costBeforeGst - materialCost - shopFees;
      const subNet = data.grossSales - costBeforeGst - materialCost;

      await prisma.revenue.update({
        where: {
          id: data.id,
          companyId: "odetail",
        },
        data: {
          costBeforeGst: costBeforeGst,
          costAfterGst: afterGst,
          materialCost: materialCost,
          jobNet: jobNet,
          subNet: subNet,
          trueNet: subNet,
          shopFees: shopFees,
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
        companyId: "odetail",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
