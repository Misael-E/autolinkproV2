import { prisma } from "@repo/database";
import { COMPANY_ID } from "@/lib/constants";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const OutstandingReceivables = async ({ locationId }: { locationId: string }) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: COMPANY_ID,
      locationId,
      status: { in: ["Pending", "Overdue"] },
    },
    select: { status: true, services: { select: { price: true } } },
  });

  let pending = 0;
  let overdue = 0;

  for (const inv of invoices) {
    const total = inv.services.reduce((s, sv) => s + sv.price, 0);
    if (inv.status === "Pending") pending += total;
    else overdue += total;
  }

  const total = pending + overdue;
  const overduePct = total > 0 ? Math.round((overdue / total) * 100) : 0;

  return (
    <div className="bg-aztecBlack-dark rounded-xl p-5 flex flex-col gap-3 flex-1">
      <div>
        <h2 className="text-sm font-bold text-white">Outstanding</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">Unpaid receivables</p>
      </div>

      <p className={`text-2xl font-bold ${total > 0 ? "text-red-400" : "text-aztecGreen"}`}>
        ${fmt(total)}
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <span className="text-aztecOrange font-medium">Pending</span>
          <span className="text-white font-semibold">${fmt(pending)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-red-400 font-medium">Overdue</span>
          <span className="text-white font-semibold">${fmt(overdue)}</span>
        </div>
      </div>

      <div className="w-full bg-aztecBlack rounded-full h-1.5 overflow-hidden mt-auto">
        <div
          className="h-1.5 rounded-full bg-red-500"
          style={{ width: `${overduePct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-600">{overduePct}% overdue</p>
    </div>
  );
};

export default OutstandingReceivables;
