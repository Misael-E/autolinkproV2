import { prisma } from "@repo/database";
import { COMPANY_ID } from "@/lib/constants";

const statusConfig: Record<
  string,
  { bar: string; text: string; bg: string; dot: string }
> = {
  Paid: {
    bar: "bg-aztecGreen",
    text: "text-aztecGreen",
    bg: "bg-aztecGreen/10",
    dot: "bg-aztecGreen",
  },
  Pending: {
    bar: "bg-aztecOrange",
    text: "text-aztecOrange",
    bg: "bg-aztecOrange/10",
    dot: "bg-aztecOrange",
  },
  Draft: {
    bar: "bg-gray-500",
    text: "text-gray-400",
    bg: "bg-gray-500/10",
    dot: "bg-gray-500",
  },
  Overdue: {
    bar: "bg-red-500",
    text: "text-red-400",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
  },
};

const InvoiceStatusBreakdown = async ({
  startDate,
  endDate,
  locationId,
}: {
  startDate: string;
  endDate: string;
  locationId: string;
}) => {
  const dateFilter = { gte: new Date(startDate), lte: new Date(endDate) };

  const [groups, revenueByStatus] = await Promise.all([
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { companyId: COMPANY_ID, locationId, createdAt: dateFilter },
    }),
    prisma.invoice.findMany({
      where: { companyId: COMPANY_ID, locationId, createdAt: dateFilter },
      select: { status: true, services: { select: { price: true } } },
    }),
  ]);

  const revenueMap: Record<string, number> = {};
  for (const inv of revenueByStatus) {
    const total = inv.services.reduce((s, sv) => s + (sv.price ?? 0), 0);
    revenueMap[inv.status] = (revenueMap[inv.status] ?? 0) + total;
  }

  const total = groups.reduce((s, g) => s + g._count.id, 0);
  const order = ["Paid", "Pending", "Overdue", "Draft"];
  const sorted = [...groups].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
  );

  return (
    <div className="bg-aztecBlack-dark rounded-xl p-5 h-full flex flex-col">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Invoice Status</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {total} total invoice{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {sorted.map((g) => {
          const cfg = statusConfig[g.status] ?? statusConfig["Draft"]!;
          const pct = Math.round((g._count.id / total) * 100);
          const revenue = revenueMap[g.status] ?? 0;

          return (
            <div key={g.status}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-sm font-semibold ${cfg.text}`}>
                    {g.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    ${revenue.toLocaleString()}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${cfg.bg}`}>
                    <span className={`text-xs font-bold ${cfg.text}`}>
                      {g._count.id}
                    </span>
                    <span className={`text-[10px] ${cfg.text} opacity-70`}>
                      ({pct}%)
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-aztecBlack rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${cfg.bar} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-aztecBlack-light grid grid-cols-2 gap-3">
        {sorted.map((g) => {
          const cfg = statusConfig[g.status] ?? statusConfig["Draft"]!;
          const revenue = revenueMap[g.status] ?? 0;
          return (
            <div key={g.status} className={`rounded-lg px-3 py-2 ${cfg.bg}`}>
              <p className={`text-xs font-medium ${cfg.text}`}>{g.status}</p>
              <p className="text-white text-sm font-bold">
                ${revenue.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceStatusBreakdown;
