"use server";

import { QuoteSchema } from "@repo/types";
import { prisma } from "@repo/database";

const COMPANY_ID = "odetail";

type CurrentState = { success: boolean; error: boolean };

export const createQuote = async (
  currentState: CurrentState,
  data: QuoteSchema,
) => {
  try {
    await prisma.$transaction(async (prisma) => {
      let customer = await prisma.customer.findUnique({
        where: {
          namePhone: {
            firstName: data.firstName,
            phone: data.phone,
          },
          companyId: COMPANY_ID,
        },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            streetAddress1: data.streetAddress1,
            email: data.email,
            customerType: data.customerType,
            returnCounter: 1,
            companyId: COMPANY_ID,
          },
        });
      }

      const serviceRecords = data.services
        ? await Promise.all(
            data.services.map(async (service) => {
              return await prisma.service.create({
                data: {
                  code: service.code,
                  serviceType: service.serviceType,
                  vehicleType: service.vehicleType,
                  distributor: service.invoiceType,
                  quantity: service.quantity,
                  price: parseFloat(service.price),
                  materialCost: service.materialCost,
                  gasCost: service.gasCost,
                  shopFees: service.shopFees,
                  notes: service.notes,
                  companyId: COMPANY_ID,
                },
              });
            }),
          )
        : [];

      const quote = await prisma.quote.create({
        data: {
          customerId: customer.id,
          customerType: data.customerType,
          status: data.status,
          notes: data.notes,
          companyId: COMPANY_ID,
          services: {
            connect: serviceRecords.map((s) => ({ id: s.id })),
          },
        },
      });

      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          quoteNumber: quote.id.toString().padStart(5, "0"),
        },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateQuote = async (
  currentState: CurrentState,
  data: QuoteSchema,
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.customer.update({
        where: { id: data.customerId, companyId: COMPANY_ID },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          streetAddress1: data.streetAddress1,
          email: data.email,
          customerType: data.customerType,
          updatedAt: new Date(),
        },
      });

      await prisma.quote.update({
        where: { id: data.id, companyId: COMPANY_ID },
        data: {
          status: data.status,
          notes: data.notes,
          customerType: data.customerType,
          updatedAt: new Date(),
        },
      });

      const existingServices = await prisma.service.findMany({
        where: { quoteId: data.id, companyId: COMPANY_ID },
        select: { id: true },
      });
      const existingServiceIds = existingServices.map((s) => s.id);

      if (data.services) {
        const updatedServiceIds = new Set<number>();

        await Promise.all(
          data.services.map(async (service) => {
            if (service.id && existingServiceIds.includes(service.id)) {
              await prisma.service.update({
                where: { id: service.id, companyId: COMPANY_ID },
                data: {
                  code: service.code,
                  serviceType: service.serviceType,
                  vehicleType: service.vehicleType,
                  distributor: service.invoiceType,
                  quantity: service.quantity,
                  price: parseFloat(service.price),
                  materialCost: service.materialCost,
                  gasCost: service.gasCost,
                  shopFees: service.shopFees,
                  notes: service.notes,
                  updatedAt: new Date(),
                },
              });
              updatedServiceIds.add(service.id);
            } else {
              const newService = await prisma.service.create({
                data: {
                  code: service.code,
                  serviceType: service.serviceType,
                  vehicleType: service.vehicleType,
                  distributor: service.invoiceType,
                  quantity: service.quantity,
                  price: parseFloat(service.price),
                  materialCost: service.materialCost,
                  gasCost: service.gasCost,
                  shopFees: service.shopFees,
                  notes: service.notes,
                  quoteId: data.id,
                  companyId: COMPANY_ID,
                },
              });
              updatedServiceIds.add(newService.id);
            }
          }),
        );

        const servicesToDelete = existingServiceIds.filter(
          (id) => !updatedServiceIds.has(id),
        );
        if (servicesToDelete.length > 0) {
          await prisma.service.deleteMany({
            where: { id: { in: servicesToDelete }, companyId: COMPANY_ID },
          });
        }
      }
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteQuote = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = parseInt(data.get("id") as string);

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.service.deleteMany({
        where: { quoteId: id, companyId: COMPANY_ID },
      });

      await prisma.quote.delete({
        where: { id, companyId: COMPANY_ID },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
