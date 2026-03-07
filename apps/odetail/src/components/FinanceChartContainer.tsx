import { prisma } from "@repo/database";
import FinanceChart from "./FinanceChart";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FinanceChartContainer = async () => {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        companyId: "odetail",
        status: "Paid",
        createdAt: { gte: startOfYear, lt: startOfNextYear },
      },
      select: {
        createdAt: true,
        services: { select: { price: true } },
      },
    }),
    prisma.expense.findMany({
      where: {
        companyId: "odetail",
        date: { gte: startOfYear, lt: startOfNextYear },
      },
      select: { date: true, cost: true },
    }),
  ]);

  const incomeByMonth: Record<number, number> = {};
  const expenseByMonth: Record<number, number> = {};

  for (const inv of invoices) {
    const month = new Date(inv.createdAt).getMonth();
    const total = inv.services.reduce((s, sv) => s + sv.price, 0);
    incomeByMonth[month] = (incomeByMonth[month] ?? 0) + total;
  }

  for (const exp of expenses) {
    const month = new Date(exp.date).getMonth();
    expenseByMonth[month] = (expenseByMonth[month] ?? 0) + exp.cost;
  }

  const data = MONTHS.map((name, i) => ({
    name,
    income: Math.round(incomeByMonth[i] ?? 0),
    expense: Math.round(expenseByMonth[i] ?? 0),
  }));

  return <FinanceChart data={data} year={year} />;
};

export default FinanceChartContainer;
