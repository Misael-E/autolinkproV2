import { Distributor, prisma } from "@repo/database";
import { getCurrentMonthRange, getTotalValue } from "@/lib/util";

type SummaryRow = {
  summaryType: string;
};

const SummaryRow = async ({ type }: { type: SummaryRow }) => {
  const { startDate, endDate } = getCurrentMonthRange();

  let totals;

  if (type.summaryType === "billing") {
    totals = await prisma.revenue.aggregate({
      _sum: {
        grossSales: true,
        costBeforeGst: true,
        costAfterGst: true,
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        companyId: "odetail",
      },
    });
  } else {
    totals = await prisma.statement.aggregate({
      _sum: {
        grossSalesGst: true,
        costBeforeGst: true,
        costAfterGst: true,
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        companyId: "odetail",
      },
    });
  }

  // Extract values
  const totalGrossSales =
    type.summaryType === "billing"
      ? getTotalValue(
          totals as {
            _sum: {
              grossSales: number | null;
              costBeforeGst: number | null;
              costAfterGst: number | null;
            };
          },
          "grossSales"
        )
      : getTotalValue(
          totals as {
            _sum: {
              grossSalesGst: number | null;
              costBeforeGst: number | null;
              costAfterGst: number | null;
            };
          },
          "grossSalesGst"
        );

  const totalBeforeGst = totals._sum.costBeforeGst ?? 0;
  const totalAfterGst = totals._sum.costAfterGst ?? 0;

  return (
    <div className="w-full bg-odetailBlack-light p-4 rounded-md text-white flex font-semibold justify-between mt-2">
      <span className="">
        Total Gross Sales:{" "}
        <p className="text-lg text-odetailGreen">
          ${totalGrossSales.toFixed(2)}
        </p>
      </span>
      <span className="">
        Total Before GST:
        <p className="text-lg text-odetailGreen">
          ${totalBeforeGst.toFixed(2)}
        </p>
      </span>
      <span className="">
        Total After GST:{" "}
        <p className="text-lg text-odetailGreen">${totalAfterGst.toFixed(2)}</p>
      </span>
    </div>
  );
};

export default SummaryRow;
