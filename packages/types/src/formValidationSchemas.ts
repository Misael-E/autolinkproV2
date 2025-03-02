import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  email: z.string().min(1, { message: "Email is required!" }),
  streetAddress1: z
    .string()
    .min(1, { message: "Street Address 1 is required!" }),
  streetAddress2: z.string(),
  postalCode: z.string(),
  city: z.string().optional(),
  notes: z.string().optional(),
  returnCounter: z.number().default(1),
  subscriptionWarranty: z.boolean().default(false),
  companyName: z.string(),
});

export type CustomerSchema = z.infer<typeof customerSchema>;

export const serviceSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  vehicleType: z.enum([
    "Suv",
    "Truck",
    "Sedan",
    "Minivan",
    "Convertible",
    "Hatchback",
    "Coupe",
  ]),
  serviceType: z.string().min(1, "Service type is required"),
  invoiceType: z.enum(["A", "M", "O"]),
  code: z.string().min(1, { message: "Code is required!" }),
  quantity: z.preprocess((val) => Number(val) || 1, z.number().min(1)),
  price: z.string().min(1, { message: "price is required!" }),
  materialCost: z.string().optional().default("0"),
  gasCost: z.string().optional().default("0"),
  shopFees: z.string().optional().default("0"),
  notes: z.string().optional(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;

export const employeeSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  role: z.string().min(1, { message: "role is required!" }),
});

export type EmployeeSchema = z.infer<typeof employeeSchema>;

export const appointmentSchema = z.object({
  id: z.number().optional(),
  customerId: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  title: z.string().min(3, { message: "Appointment title is required!" }),
  startTime: z.string({ message: "Start time is required!" }),
  endTime: z.string({ message: "End time is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  streetAddress1: z.string().min(1, { message: "Street Address is required!" }),
  description: z.string().optional(),
  services: z.array(serviceSchema).optional(),
});

export type AppointmentSchema = z.infer<typeof appointmentSchema>;

export const invoiceSchema = z.object({
  id: z.number().optional(),
  customerId: z.string().optional(),
  appointmentId: z.number().optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  streetAddress1: z.string().min(1, { message: "Street Address is required!" }),
  status: z.enum(["Draft", "Pending", "Paid", "Overdue"]).default("Draft"),
  paymentType: z
    .enum([
      "Debit",
      "Mastercard",
      "Cash",
      "Amex",
      "Visa",
      "Cheque",
      "ETransfer",
      "Other",
    ])
    .optional(),
  services: z.array(serviceSchema).optional(),
});

export type InvoiceSchema = z.infer<typeof invoiceSchema>;

export const revenueSchema = z.object({
  id: z.number().optional(),
  costBeforeGst: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  serviceId: z.number().optional(),
  companyId: z.string().optional(),
  materialCost: z
    .preprocess((val) => Number(val) || 0, z.number())
    .optional()
    .default(0),
  shopFees: z.preprocess((val) => Number(val) || 0, z.number()).optional(),
  grossSalesGst: z.number().optional().default(0),
  jobNet: z.number().optional().default(0),
  subNet: z.number().optional().default(0),
  trueNet: z.number().optional().default(0),
  gasCost: z.number().optional().default(0),
  grossSales: z.number().optional().default(0),
});

export type RevenueSchema = z.infer<typeof revenueSchema>;

export const expenseSchema = z.object({
  id: z.number().optional(),
  cost: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  paymentType: z
    .enum([
      "Debit",
      "Mastercard",
      "Cash",
      "Amex",
      "Visa",
      "Cheque",
      "ETransfer",
      "Other",
    ])
    .default("Visa"),
  companyId: z.string().optional(),
  description: z.string().min(3, { message: "Description is required!" }),
  date: z.string({ message: "Expense date is required!" }),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;

export const serviceCatalogSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name of service is required!" }),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val) || 0, z.number()).optional(),
  isPackage: z.boolean().optional().default(false),
  createdAt: z.string().optional(),
});

export type ServiceCatalogSchema = z.infer<typeof serviceCatalogSchema>;
