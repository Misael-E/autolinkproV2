import { prisma } from "@repo/database";
import { COMPANY_ID } from "@/lib/constants";
import FinanceChart from "./FinanceChart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FinanceChartContainer = async ({ locationId }: { locationId: string }) => {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const [revenues, expenses] = await Promise.all([
    prisma.revenue.findMany({
      where: {
        companyId: COMPANY_ID,
        locationId,
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { grossSales: true, createdAt: true },
    }),
    prisma.expense.findMany({
      where: {
        companyId: COMPANY_ID,
        locationId,
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { cost: true, createdAt: true },
    }),
  ]);

  const incomeByMonth: number[] = Array(12).fill(0);
  const expenseByMonth: number[] = Array(12).fill(0);

  for (const r of revenues) {
    const m = new Date(r.createdAt).getMonth();
    incomeByMonth[m] += r.grossSales ?? 0;
  }
  for (const e of expenses) {
    const m = new Date(e.createdAt).getMonth();
    expenseByMonth[m] += e.cost ?? 0;
  }

  const data = MONTHS.map((name, i) => ({
    name,
    income: Math.round(incomeByMonth[i]),
    expense: Math.round(expenseByMonth[i]),
  }));

  return <FinanceChart data={data} year={year} />;
};

export default FinanceChartContainer;
