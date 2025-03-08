"use server";

import { InvoiceSchema } from "@repo/types";
import { prisma } from "@repo/database";
import { createRevenue } from "./revenue";

type CurrentState = { success: boolean; error: boolean };

// INVOICE ACTIONS
export const createInvoice = async (
  currentState: CurrentState,
  data: InvoiceSchema
) => {
  try {
    await prisma.$transaction(async (prisma) => {
      let customer = await prisma.customer.findUnique({
        where: {
          namePhone: {
            firstName: data.firstName,
            phone: data.phone,
          },
          companyId: "aztec",
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
            returnCounter: 1,
            companyId: "aztec",
          },
        });

        // revalidatePath("/list/customers");
      } else {
        await prisma.customer.update({
          where: { id: customer.id, companyId: "aztec" },
          data: {
            returnCounter: {
              increment: 1,
            },
            lastVisit: new Date(),
          },
        });
      }

      if (data.services) {
        const serviceRecords = await Promise.all(
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
                notes: service.notes,
                companyId: "aztec",
              },
            });
          })
        );

        await prisma.invoice.create({
          data: {
            customer: {
              connect: {
                id: customer.id,
              },
            },
            services: {
              connect: serviceRecords.map((service) => ({ id: service.id })),
            },
            company: {
              connect: {
                id: "aztec",
              },
            },
            status: data.status,
          },
        });
      }
    });

    // revalidatePath("/list/invoices");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateInvoice = async (
  currentState: CurrentState,
  data: InvoiceSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    await prisma.$transaction(async (prisma) => {
      // 1️⃣ Update customer details
      await prisma.customer.update({
        where: { id: data.customerId, companyId: "aztec" },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          streetAddress1: data.streetAddress1,
          email: data.email,
          updatedAt: new Date(),
        },
      });

      // 2️⃣ Update invoice details
      await prisma.invoice.update({
        where: { id: data.id, companyId: "aztec" },
        data: {
          paymentType: data.paymentType,
          status: data.status,
          updatedAt: new Date(),
        },
      });

      // 3️⃣ Fetch existing services linked to this invoice
      const existingServices = await prisma.service.findMany({
        where: { invoiceId: data.id, companyId: "aztec" },
        select: { id: true },
      });

      const existingServiceIds = existingServices.map((s) => s.id);

      if (data.services) {
        // 4️⃣ Process services: update existing, create new
        const updatedServiceIds = new Set(); // Track services being processed

        await Promise.all(
          data.services.map(async (service) => {
            if (service.id && existingServiceIds.includes(service.id)) {
              // ✅ Update existing service
              await prisma.service.update({
                where: { id: service.id, companyId: "aztec" },
                data: {
                  code: service.code,
                  serviceType: service.serviceType,
                  vehicleType: service.vehicleType,
                  distributor: service.invoiceType,
                  quantity: service.quantity,
                  price: parseFloat(service.price),
                  materialCost: service.materialCost,
                  gasCost: service.gasCost,
                  notes: service.notes,
                  updatedAt: new Date(),
                },
              });
              updatedServiceIds.add(service.id); // Track updated service
            } else {
              // 🆕 Create new service (only if it's not a duplicate)
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
                  notes: service.notes,
                  invoiceId: data.id,
                  companyId: "aztec",
                },
              });
              updatedServiceIds.add(newService.id);
            }
          })
        );

        // 5️⃣ Delete services that are no longer in the updated invoice
        const servicesToDelete = existingServiceIds.filter(
          (id) => !updatedServiceIds.has(id) // Remove only services that are not in the new list
        );

        if (servicesToDelete.length > 0) {
          // Delete revenue first to avoid constraint errors
          await prisma.revenue.deleteMany({
            where: { serviceId: { in: servicesToDelete }, companyId: "aztec" },
          });

          // Now delete services
          await prisma.service.deleteMany({
            where: { id: { in: servicesToDelete }, companyId: "aztec" },
          });
        }

        // 6️⃣ Recalculate revenue if invoice is marked as "Paid"
        if (data.status === "Paid") {
          await createRevenue(data.id as number);
        }
      }
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteInvoice = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const invoiceId = parseInt(id);

  try {
    await prisma.$transaction(async (prisma) => {
      // 1️⃣ Fetch services linked to the invoice
      const services = await prisma.service.findMany({
        where: {
          invoiceId: invoiceId,
          companyId: "aztec",
        },
        select: { id: true },
      });

      const serviceIds = services.map((service) => service.id);

      if (serviceIds.length > 0) {
        // 2️⃣ Delete revenue records associated with those services
        await prisma.revenue.deleteMany({
          where: {
            serviceId: { in: serviceIds },
            companyId: "aztec",
          },
        });

        // 3️⃣ Delete services directly
        await prisma.service.deleteMany({
          where: {
            id: { in: serviceIds },
            companyId: "aztec",
          },
        });
      }

      // 4️⃣ Finally, delete the invoice
      await prisma.invoice.delete({
        where: { id: invoiceId, companyId: "aztec" },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
