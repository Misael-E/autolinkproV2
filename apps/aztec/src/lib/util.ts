import { Customer, Service } from "@repo/database";
import { EventType } from "./types";
import moment from "moment";

export const formatDate = (date: Date): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const createDateAsUTC = (date: Date) => {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
};

export const convertDateToUTC = (date: Date) => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};

export const calculateTotalPrice = (services: { price: number }[]): number => {
  return Number(
    services.reduce((acc, service) => acc + service.price, 0).toFixed(2)
  );
};

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  appointments: {
    id: number;
    title: string;
    start: Date;
    end: Date;
    description: string | null;
    resource: {
      customer: Customer | null;
      services: Service[] | null;
    };
  }[]
): {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string | null;
  resource: {
    customer: Customer | null;
    services: Service[] | null;
  };
}[] => {
  const latestMonday = getLatestMonday();

  return appointments.map((appointment) => {
    const appointmentDayOfWeek = appointment.start.getDay();

    const daysFromMonday =
      appointmentDayOfWeek === 0 ? 6 : appointmentDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      appointment.start.getHours(),
      appointment.start.getMinutes(),
      appointment.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      appointment.end.getHours(),
      appointment.end.getMinutes(),
      appointment.end.getSeconds()
    );

    return {
      id: appointment.id,
      title: appointment.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
      description: appointment.description,
      resource: appointment.resource,
    };
  });
};

export const calculateInvoiceTotals = (services: { price: number }[]) => {
  const subtotal = services.reduce((acc, service) => acc + service.price, 0);
  const taxRate = 0.05; // 5% GST
  const gst = subtotal * taxRate;
  const total = subtotal + gst;

  return {
    subtotal: subtotal.toFixed(2),
    gst: gst.toFixed(2),
    total: total.toFixed(2),
  };
};

export const convertDatesToISO = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToISO);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        value instanceof Date ? value.toISOString() : convertDatesToISO(value),
      ])
    );
  }
  return obj;
};

export const convertRawToDates = (rawEvents: EventType[]) => {
  return rawEvents.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
};

export const formatPhoneNumber = (phone: string) => {
  // Remove any non-digit characters (optional, in case input has dashes or spaces)
  const cleaned = ("" + phone).replace(/\D/g, "");

  // Check if the input is of correct length
  if (cleaned.length === 10) {
    const areaCode = cleaned.slice(0, 3);
    const centralOfficeCode = cleaned.slice(3, 6);
    const lineNumber = cleaned.slice(6);
    return `(${areaCode}) ${centralOfficeCode}-${lineNumber}`;
  }

  // Return the original phone if it's not 10 digits
  return phone;
};

export function splitAddress(address: string | undefined | null) {
  if (!address) return { line1: "", line2: "" };

  // Split by the pipe character
  const parts = address.split("|").map((p) => p.trim());

  return {
    line1: parts[0] || "",
    line2: parts[1] || "",
  };
}

export const getCurrentMonthRange = () => {
  const startDate = moment().startOf("month").toISOString(); // First day of the month (e.g., "2025-02-01T00:00:00.000Z")
  const endDate = moment().endOf("month").toISOString(); // Last day of the month (e.g., "2025-02-28T23:59:59.999Z")

  return { startDate, endDate };
};

export const calculateCreditAgingBuckets = (
  revenues: { createdAt: Date; costBeforeGst: number | null }[],
  totalPaid: number
) => {
  const today = moment();
  let dynamicCurrent = 0,
    dynamicThirty = 0,
    dynamicSixty = 0,
    dynamicSixtyPlus = 0;

  revenues.forEach((rev) => {
    const invoiceDate = moment(rev.createdAt);
    const days = today.diff(invoiceDate, "days");
    const charge = rev.costBeforeGst || 0;

    if (days < 30) {
      dynamicCurrent += charge;
    } else if (days < 60) {
      dynamicThirty += charge;
    } else if (days < 90) {
      dynamicSixty += charge;
    } else {
      dynamicSixtyPlus += charge;
    }
  });

  let remainingPayment = totalPaid;

  if (remainingPayment > 0 && dynamicSixtyPlus > 0) {
    if (remainingPayment >= dynamicSixtyPlus) {
      remainingPayment -= dynamicSixtyPlus;
      dynamicSixtyPlus = 0;
    } else {
      dynamicSixtyPlus -= remainingPayment;
      remainingPayment = 0;
    }
  }
  if (remainingPayment > 0 && dynamicSixty > 0) {
    if (remainingPayment >= dynamicSixty) {
      remainingPayment -= dynamicSixty;
      dynamicSixty = 0;
    } else {
      dynamicSixty -= remainingPayment;
      remainingPayment = 0;
    }
  }
  if (remainingPayment > 0 && dynamicThirty > 0) {
    if (remainingPayment >= dynamicThirty) {
      remainingPayment -= dynamicThirty;
      dynamicThirty = 0;
    } else {
      dynamicThirty -= remainingPayment;
      remainingPayment = 0;
    }
  }
  if (remainingPayment > 0 && dynamicCurrent > 0) {
    if (remainingPayment >= dynamicCurrent) {
      remainingPayment -= dynamicCurrent;
      dynamicCurrent = 0;
    } else {
      dynamicCurrent -= remainingPayment;
      remainingPayment = 0;
    }
  }

  console.log(`Current: ${dynamicCurrent}`);
  console.log(`Thirty: ${dynamicThirty}`);
  console.log(`Sixty: ${dynamicSixty}`);
  console.log(`Sixty Plus: ${dynamicSixtyPlus}`);

  const amountDue =
    dynamicCurrent + dynamicThirty + dynamicSixty + dynamicSixtyPlus;
  const totalGST = amountDue * 0.05;
  return {
    current: dynamicCurrent,
    thirty: dynamicThirty,
    sixty: dynamicSixty,
    sixtyPlus: dynamicSixtyPlus,
    amountDue: dynamicCurrent + dynamicThirty + dynamicSixty + dynamicSixtyPlus,
    totalGST: totalGST,
  };
};

export const getTotalValue = <K extends string>(
  totals: { _sum: Record<K, number | null> },
  key: K
): number => {
  return totals._sum[key] ?? 0;
};
