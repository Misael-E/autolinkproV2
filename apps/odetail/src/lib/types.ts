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
  TotalShopFees = "totalShopFees",
  JobNet = "jobNet",
  SubNet = "subNet",
  TrueNet = "trueNet",
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
