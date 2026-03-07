import { prisma } from "@repo/database";

const rankStyles = [
  { badge: "bg-yellow-400 text-black", glow: "shadow-yellow-400/30" },
  { badge: "bg-gray-300 text-black", glow: "shadow-gray-300/20" },
  { badge: "bg-orange-400 text-black", glow: "shadow-orange-400/30" },
];

const customerTypeColors: Record<string, string> = {
  Retailer: "text-odetailBlue",
  Insurance: "text-odetailGreen",
  Fleet: "text-odetailOrange",
  Vendor: "text-purple-400",
};

const TopCustomers = async ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: "odetail",
      createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, customerType: true },
      },
      services: { select: { price: true } },
    },
  });

  const map: Record<
    string,
    { name: string; type: string; jobs: number; revenue: number }
  > = {};

  for (const inv of invoices) {
    if (!inv.customer) continue;
    const id = inv.customer.id;
    const revenue = inv.services.reduce((s, sv) => s + sv.price, 0);
    if (map[id]) {
      map[id].jobs += 1;
      map[id].revenue += revenue;
    } else {
      map[id] = {
        name: `${inv.customer.firstName} ${inv.customer.lastName ?? ""}`.trim(),
        type: inv.customer.customerType,
        jobs: 1,
        revenue,
      };
    }
  }

  const ranked = Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topRevenue = ranked[0]?.revenue ?? 1;

  return (
    <div className="bg-odetailBlack-dark rounded-xl p-5">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-lg font-bold text-white">Top Customers</h1>
          <p className="text-xs text-gray-500 mt-0.5">By total spend</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ranked.map((c, i) => {
          const style = rankStyles[i] ?? { badge: "bg-odetailBlack-light text-gray-400", glow: "" };
          const pct = Math.round((c.revenue / topRevenue) * 100);
          const typeColor = customerTypeColors[c.type] ?? "text-gray-400";

          return (
            <div key={c.name} className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md ${style.badge} ${style.glow}`}
              >
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white truncate pr-2">
                    {c.name}
                  </span>
                  <span className="text-sm font-bold text-odetailGreen flex-shrink-0">
                    ${c.revenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 mb-1.5">
                  <span className="text-[11px] text-gray-500">
                    {c.jobs} invoice{c.jobs !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[11px] text-gray-600">·</span>
                  <span className={`text-[11px] font-medium ${typeColor}`}>
                    {c.type}
                  </span>
                </div>

                <div className="w-full bg-odetailBlack rounded-full h-1 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-odetailBlue to-odetailGreen"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopCustomers;
