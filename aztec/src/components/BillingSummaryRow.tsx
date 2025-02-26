import prisma from "@/lib/prisma";
import { getCurrentMonthRange } from "@/lib/util";

const BillingSummaryRow = async () => {
  const { startDate, endDate } = getCurrentMonthRange();

  const totals = await prisma.revenue.aggregate({
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
    },
  });

  // Extract values
  const totalGrossSales = totals._sum.grossSales ?? 0;
  const totalBeforeGst = totals._sum.costBeforeGst ?? 0;
  const totalAfterGst = totals._sum.costAfterGst ?? 0;

  return (
    <div className="w-full bg-aztecBlack-light p-4 rounded-md text-white flex font-semibold justify-between mt-2">
      <span className="">
        Total Gross Sales:{" "}
        <p className="text-lg text-aztecGreen">${totalGrossSales.toFixed(2)}</p>
      </span>
      <span className="">
        Total Before GST:
        <p className="text-lg text-aztecGreen">${totalBeforeGst.toFixed(2)}</p>
      </span>
      <span className="">
        Total After GST:{" "}
        <p className="text-lg text-aztecGreen">${totalAfterGst.toFixed(2)}</p>
      </span>
    </div>
  );
};

export default BillingSummaryRow;
