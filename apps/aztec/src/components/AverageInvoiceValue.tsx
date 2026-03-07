import { prisma } from "@repo/database";
import { COMPANY_ID } from "@/lib/constants";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AverageInvoiceValue = async ({
  startDate,
  endDate,
  locationId,
}: {
  startDate: string;
  endDate: string;
  locationId: string;
}) => {
  const dateFilter = { gte: new Date(startDate), lte: new Date(endDate) };

  const paidInvoices = await prisma.invoice.findMany({
    where: { companyId: COMPANY_ID, locationId, status: "Paid", createdAt: dateFilter },
    select: { services: { select: { price: true } } },
  });

  const totals = paidInvoices.map((inv) =>
    inv.services.reduce((s, sv) => s + sv.price, 0)
  );

  const avg = totals.length > 0 ? totals.reduce((s, v) => s + v, 0) / totals.length : 0;
  const highest = totals.length > 0 ? Math.max(...totals) : 0;
  const lowest = totals.length > 0 ? Math.min(...totals) : 0;

  return (
    <div className="bg-aztecBlack-dark rounded-xl p-5 flex flex-col gap-3 flex-1">
      <div>
        <h2 className="text-sm font-bold text-white">Avg Invoice Value</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">Paid invoices only</p>
      </div>

      <p className="text-2xl font-bold text-aztecBlue">${fmt(avg)}</p>

      <div className="flex flex-col gap-1.5 mt-auto">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Highest</span>
          <span className="text-aztecGreen font-semibold">${fmt(highest)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Lowest</span>
          <span className="text-gray-300 font-semibold">${fmt(lowest)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Sample size</span>
          <span className="text-gray-300 font-semibold">{paidInvoices.length} invoices</span>
        </div>
      </div>
    </div>
  );
};

export default AverageInvoiceValue;
