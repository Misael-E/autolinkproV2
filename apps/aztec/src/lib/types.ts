import { Customer, Invoice, Service } from "@repo/database";

export type EventType = {
  id: number;
  title: string;
  start: Date | string;
  end: Date | string;
  description: string | null;
  resource: {
    customer: Customer | null;
    services: Service[] | null;
    invoice: Invoice[] | null;
    status: string;
  };
};

export type CustomerOption = {
  value: string;
  label: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  streetAddress1: string;
};

export type SingleInvoice =
  | (Invoice & { customer: Customer } & { services: Service[] })
  | null;

export enum BillingType {
  TotalMaterials = "totalMaterials",
  TotalWindshield = "totalWindshield",
  TotalGas = "totalGas",
  JobNet = "jobNet",
  SubNet = "subNet",
  TrueNet = "trueNet",
}

export enum CustomerType {
  Retailer = "Retailer",
  Vendor = "Vendor",
  Fleet = "Fleet",
  Other = "Other",
}

export enum StatementType {
  TotalAmountPaid = "totalAmountPaid",
  TotalGrossSalesBeforeGst = "totalGrossSalesBeforeGst",
  TotalGrossSalesAfterGst = "totalGrossSalesAfterGst",
}

export enum BillingTotalsType {
  GrossSales = "grossSales",
  CostBeforeGst = "costBeforeGst",
  CostAfterGst = "costAfterGst",
}

export enum RoleEnum {
  Admin = "admin",
  Member = "member",
}

export enum SummaryType {
  Billing = "billing",
  Expense = "expense",
  Statement = "statement",
}
