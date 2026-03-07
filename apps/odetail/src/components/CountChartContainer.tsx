import { prisma } from "@repo/database";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CountChartContainer = async ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const dateFilter = { gte: new Date(startDate), lte: new Date(endDate) };

  const [paidInvoices, expenseAgg, totalInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId: "odetail", status: "Paid", createdAt: dateFilter },
      select: { services: { select: { price: true } } },
    }),
    prisma.expense.aggregate({
      _sum: { cost: true },
      where: { companyId: "odetail", date: dateFilter },
    }),
    prisma.invoice.count({
      where: { companyId: "odetail", createdAt: dateFilter },
    }),
  ]);

  const grossRevenue = paidInvoices.reduce(
    (sum, inv) => sum + inv.services.reduce((s, sv) => s + sv.price, 0),
    0
  );
  const totalExpenses = expenseAgg._sum.cost ?? 0;
  const gst = grossRevenue * 0.05;
  const netProfit = grossRevenue - totalExpenses;
  const margin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
  const expensePct =
    grossRevenue > 0 ? Math.min(100, Math.round((totalExpenses / grossRevenue) * 100)) : 0;

  return (
    <div className="bg-odetailBlack-dark rounded-xl w-full h-full p-5 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-white">Revenue Summary</h1>
        <p className="text-xs text-gray-500 mt-0.5">Based on paid invoices</p>
      </div>

      {/* GROSS REVENUE */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Gross Revenue</span>
          <span className="text-sm font-bold text-odetailGreen">${fmt(grossRevenue)}</span>
        </div>
        <div className="w-full bg-odetailBlack rounded-full h-2">
          <div className="h-2 rounded-full bg-odetailGreen w-full" />
        </div>
      </div>

      {/* EXPENSES */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Expenses</span>
          <span className="text-sm font-bold text-odetailOrange">${fmt(totalExpenses)}</span>
        </div>
        <div className="w-full bg-odetailBlack rounded-full h-2">
          <div
            className="h-2 rounded-full bg-odetailOrange"
            style={{ width: `${expensePct}%` }}
          />
        </div>
      </div>

      <div className="border-t border-odetailBlack-light" />

      {/* NET PROFIT */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-white" : "text-red-400"}`}>
            {netProfit < 0 ? "-" : ""}${fmt(Math.abs(netProfit))}
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-bold ${
            margin >= 0 ? "bg-odetailGreen/20 text-odetailGreen" : "bg-red-500/20 text-red-400"
          }`}
        >
          {margin}% margin
        </div>
      </div>

      {/* BOTTOM STATS */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div className="bg-odetailBlack-light rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-500 mb-0.5">GST Collected</p>
          <p className="text-sm font-bold text-odetailBlue">${fmt(gst)}</p>
        </div>
        <div className="bg-odetailBlack-light rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-500 mb-0.5">Paid Invoices</p>
          <p className="text-sm font-bold text-white">{paidInvoices.length}</p>
        </div>
        <div className="bg-odetailBlack-light rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-500 mb-0.5">Total Invoices</p>
          <p className="text-sm font-bold text-white">{totalInvoices}</p>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
