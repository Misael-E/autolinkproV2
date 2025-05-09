"use server";

import { prisma } from "@repo/database";
import { AppointmentSchema } from "@repo/types";

type CurrentState = { success: boolean; error: boolean };

// APPOINTMENT ACTIONS
export const createAppointment = async (
  currentState: CurrentState,
  data: AppointmentSchema
) => {
  try {
    await prisma.$transaction(async (prisma) => {
      let customer = await prisma.customer.findUnique({
        where: {
          namePhone: {
            firstName: data.firstName,
            phone: data.phone,
          },
          companyId: "odetail",
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
            companyId: "odetail",
          },
        });
      } else {
        await prisma.customer.update({
          where: { id: customer.id, companyId: "odetail" },
          data: {
            returnCounter: {
              increment: 1,
            },
            lastVisit: new Date(),
          },
        });
      }

      if (data.services) {
        // ✅ 3. Handle Services (Find or Create)
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
                shopFees: service.shopFees,
                notes: service.notes,
                companyId: "odetail",
              },
            });
          })
        );

        // ✅ 2. Create appointment & link to customer
        const appointment = await prisma.appointment.create({
          data: {
            title: data.title,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            description: data.description,
            customerId: customer.id,
            companyId: "odetail",
            status: data.status,
            services: {
              connect: serviceRecords.map((service) => ({
                id: service.id,
              })),
            },
          },
        });

        if (data.status !== "Draft") {
          await prisma.invoice.create({
            data: {
              customer: { connect: { id: customer.id } },
              appointment: { connect: { id: appointment.id } },
              paymentType: null,
              status: "Draft",
              company: {
                connect: { id: "odetail" },
              },
              services: {
                connect: serviceRecords.map((service) => ({
                  id: service.id,
                })),
              },
            },
          });
        }
      }
    });

    // revalidatePath("/appointments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAppointment = async (
  currentState: CurrentState,
  data: AppointmentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  const originalAppointment = await prisma.appointment.findUnique({
    where: { id: data.id, companyId: "odetail" },
    select: { status: true },
  });

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.customer.update({
        where: {
          id: data.customerId,
          companyId: "odetail",
        },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          streetAddress1: data.streetAddress1,
          email: data.email,
          updatedAt: new Date(),
        },
      });

      await prisma.appointment.update({
        where: {
          id: data.id,
          companyId: "odetail",
        },
        data: {
          description: data.description,
          title: data.title,
          status: data.status,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          updatedAt: new Date(),
        },
      });
    });

    // 3️⃣ Fetch existing services linked to this appointment
    const existingServices = await prisma.service.findMany({
      where: { appointmentId: data.id, companyId: "odetail" },
      select: { id: true },
    });

    const existingServiceIds = existingServices.map((s) => s.id);

    if (data.services) {
      const newServiceRecords = await Promise.all(
        data.services.map(async (service) => {
          if (service.id && existingServiceIds.includes(service.id)) {
            // Update existing service
            return await prisma.service.update({
              where: { id: service.id, companyId: "odetail" },
              data: {
                code: service.code,
                serviceType: service.serviceType,
                vehicleType: service.vehicleType,
                distributor: service.invoiceType,
                quantity: service.quantity,
                price: parseFloat(service.price),
                notes: service.notes,
                materialCost: service.materialCost,
                shopFees: service.shopFees,
                gasCost: service.gasCost,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new service
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
                appointmentId: data.id as number,
                companyId: "odetail",
              },
            });
          }
        })
      );

      // Disconnect Removed Services
      const newServiceIds = newServiceRecords.map((s) => s.id);
      const servicesToRemove = existingServiceIds.filter(
        (id) => !newServiceIds.includes(id)
      );

      if (servicesToRemove.length > 0) {
        await prisma.appointment.update({
          where: { id: data.id, companyId: "odetail" },
          data: {
            services: {
              disconnect: servicesToRemove.map((id) => ({ id })),
            },
            updatedAt: new Date(),
          },
        });

        // 🚨 Delete Services That Are No Longer in the Appointment
        await prisma.service.deleteMany({
          where: { id: { in: servicesToRemove }, companyId: "odetail" },
        });
      }

      await prisma.appointment.update({
        where: { id: data.id, companyId: "odetail" },
        data: {
          services: {
            connect: newServiceRecords.map((service) => ({
              id: service.id,
            })),
          },
          updatedAt: new Date(),
        },
      });

      // Update the services in invoice
      const invoice = await prisma.invoice.findFirst({
        where: { appointmentId: data.id, companyId: "odetail" },
      });

      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id, companyId: "odetail" },
          data: {
            services: {
              connect: newServiceRecords.map((service) => ({
                id: service.id,
              })),
              disconnect: servicesToRemove.map((id) => ({ id })),
            },
            updatedAt: new Date(),
          },
        });
      }
    }

    // Create invoice if changing from draft and no invoice exists
    if (originalAppointment?.status === "Draft" && data.status !== "Draft") {
      const existingInvoice = await prisma.invoice.findFirst({
        where: { appointmentId: data.id, companyId: "odetail" },
      });

      if (!existingInvoice) {
        await prisma.invoice.create({
          data: {
            customer: { connect: { id: data.customerId } },
            appointment: { connect: { id: data.id } },
            paymentType: null,
            status: "Draft",
            company: { connect: { id: "odetail" } },
            services: {
              connect: (data.services || []).map((service) => ({
                id: service.id,
              })),
            },
          },
        });
      }
    }

    // revalidatePath("/appointments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAppointment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const appointmentId = parseInt(id);

  try {
    await prisma.$transaction(async (prisma) => {
      // 1️⃣ Find Services Linked to This Appointment
      const services = await prisma.service.findMany({
        where: { appointmentId: appointmentId, companyId: "odetail" },
        select: { id: true },
      });

      const serviceIds = services.map((service) => service.id);

      // 2️⃣ Find Invoice Linked to This Appointment (if any)
      const invoice = await prisma.invoice.findFirst({
        where: { appointmentId: appointmentId, companyId: "odetail" },
        select: { id: true },
      });

      if (invoice) {
        // 3️⃣ Remove Services from Invoice Before Deleting Them
        await prisma.invoice.update({
          where: { id: invoice.id, companyId: "odetail" },
          data: {
            services: {
              disconnect: serviceIds.map((id) => ({ id })),
            },
          },
        });

        // 4️⃣ Delete the Invoice After Removing Its Services
        await prisma.invoice.delete({
          where: { id: invoice.id, companyId: "odetail" },
        });
      }

      // 5️⃣ Delete All Services Linked to This Appointment
      if (serviceIds.length > 0) {
        await prisma.service.deleteMany({
          where: { id: { in: serviceIds }, companyId: "odetail" },
        });
      }

      // 6️⃣ Finally, Delete the Appointment
      await prisma.appointment.delete({
        where: { id: appointmentId, companyId: "odetail" },
      });
    });

    // ✅ Successfully Deleted
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
