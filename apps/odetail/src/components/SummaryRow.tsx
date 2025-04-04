import { prisma } from "@repo/database";
import { getTotalValue } from "@/lib/util";
import { SummaryType } from "@/lib/types";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

interface BillingTotals {
  grossSales: number;
  costBeforeGst: number;
  costAfterGst: number;
}

interface ExpenseTotals {
  cost: number;
}

interface StatementTotals {
  grossSalesGst: number;
  costBeforeGst: number;
  costAfterGst: number;
}

type SummaryTotals = BillingTotals | ExpenseTotals | StatementTotals;

interface SummaryRowProps {
  summaryType: SummaryType;
  dateRange: DateRange;
}

const fetchSummaryTotals = async (
  summaryType: SummaryType,
  dateRange: DateRange
): Promise<SummaryTotals> => {
  const { startDate, endDate } = dateRange;
  switch (summaryType) {
    case SummaryType.Billing: {
      const billingAgg = await prisma.revenue.aggregate({
        _sum: {
          grossSales: true,
          costBeforeGst: true,
          costAfterGst: true,
        },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          companyId: "odetail",
        },
      });
      return {
        grossSales: getTotalValue(
          billingAgg as {
            _sum: {
              grossSales: number | null;
              costBeforeGst: number | null;
              costAfterGst: number | null;
            };
          },
          "grossSales"
        ),
        costBeforeGst: billingAgg._sum.costBeforeGst ?? 0,
        costAfterGst: billingAgg._sum.costAfterGst ?? 0,
      };
    }
    case SummaryType.Expense: {
      const expenseAgg = await prisma.expense.aggregate({
        _sum: {
          cost: true,
        },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          companyId: "odetail",
        },
      });
      return { cost: expenseAgg._sum.cost ?? 0 };
    }
    case SummaryType.Statement:
    default: {
      const statementAgg = await prisma.statement.aggregate({
        _sum: {
          grossSalesGst: true,
          costBeforeGst: true,
          costAfterGst: true,
        },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          companyId: "odetail",
        },
      });
      return {
        grossSalesGst: getTotalValue(
          statementAgg as {
            _sum: {
              grossSalesGst: number | null;
              costBeforeGst: number | null;
              costAfterGst: number | null;
            };
          },
          "grossSalesGst"
        ),
        costBeforeGst: statementAgg._sum.costBeforeGst ?? 0,
        costAfterGst: statementAgg._sum.costAfterGst ?? 0,
      };
    }
  }
};

const SummaryRow = async ({ summaryType, dateRange }: SummaryRowProps) => {
  const totals = await fetchSummaryTotals(summaryType, dateRange);

  let content;
  switch (summaryType) {
    case SummaryType.Billing: {
      const billingTotals = totals as BillingTotals;
      content = (
        <div className="w-full bg-odetailBlack-light p-4 rounded-md text-white flex font-semibold justify-between mt-2">
          <span>
            Total Gross Sales:{" "}
            <p className="text-lg text-odetailGreen">
              ${billingTotals.grossSales.toFixed(2)}
            </p>
          </span>
          <span>
            Total Before GST:
            <p className="text-lg text-odetailGreen">
              ${billingTotals.costBeforeGst.toFixed(2)}
            </p>
          </span>
          <span>
            Total After GST:{" "}
            <p className="text-lg text-odetailGreen">
              ${billingTotals.costAfterGst.toFixed(2)}
            </p>
          </span>
        </div>
      );
      break;
    }
    case SummaryType.Expense: {
      const expenseTotals = totals as ExpenseTotals;
      content = (
        <div className="w-full bg-odetailBlack-light p-4 rounded-md text-white flex font-semibold justify-between mt-2">
          <span>
            Total Expenses:{" "}
            <p className="text-lg text-odetailGreen">
              ${expenseTotals.cost.toFixed(2)}
            </p>
          </span>
        </div>
      );
      break;
    }
    case SummaryType.Statement: {
      const statementTotals = totals as StatementTotals;
      content = (
        <div className="w-full bg-odetailBlack-light p-4 rounded-md text-white flex font-semibold justify-between mt-2">
          <span>
            Total Gross Sales (GST):{" "}
            <p className="text-lg text-odetailGreen">
              ${statementTotals.grossSalesGst.toFixed(2)}
            </p>
          </span>
          <span>
            Total Before GST:
            <p className="text-lg text-odetailGreen">
              ${statementTotals.costBeforeGst.toFixed(2)}
            </p>
          </span>
          <span>
            Total After GST:{" "}
            <p className="text-lg text-odetailGreen">
              ${statementTotals.costAfterGst.toFixed(2)}
            </p>
          </span>
        </div>
      );
      break;
    }
    default:
      content = <div>No data available.</div>;
  }

  return content;
};

export default SummaryRow;
