import { prisma } from "@repo/database";
import { COMPANY_ID } from "@/lib/constants";

const vehicleColors: Record<string, string> = {
  Suv: "bg-aztecBlue",
  Truck: "bg-aztecOrange",
  Sedan: "bg-aztecGreen",
  Minivan: "bg-purple-400",
  Convertible: "bg-pink-400",
  Hatchback: "bg-yellow-400",
  Coupe: "bg-cyan-400",
};

const VehicleTypeBreakdown = async ({
  startDate,
  endDate,
  locationId,
}: {
  startDate: string;
  endDate: string;
  locationId: string;
}) => {
  const raw = await prisma.service.groupBy({
    by: ["vehicleType"],
    _count: { id: true },
    where: {
      companyId: COMPANY_ID,
      locationId,
      createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const total = raw.reduce((s, r) => s + r._count.id, 0);

  return (
    <div className="bg-aztecBlack-dark rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold text-white">Vehicle Types</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">{total} job{total !== 1 ? "s" : ""} total</p>
      </div>

      {raw.length === 0 ? (
        <p className="text-sm text-gray-500">No data for this period</p>
      ) : (
        <>
          <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-4 gap-px">
            {raw.map((r) => {
              const pct = Math.round((r._count.id / total) * 100);
              const color = vehicleColors[r.vehicleType] ?? "bg-gray-500";
              return (
                <div
                  key={r.vehicleType}
                  className={`h-full ${color}`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            {raw.map((r, i) => {
              const pct = Math.round((r._count.id / total) * 100);
              const color = vehicleColors[r.vehicleType] ?? "bg-gray-500";
              return (
                <div key={r.vehicleType} className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs w-4">#{i + 1}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-sm text-white flex-1">{r.vehicleType}</span>
                  <span className="text-xs text-gray-500">{r._count.id} job{r._count.id !== 1 ? "s" : ""}</span>
                  <span className="text-xs font-semibold text-gray-300 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleTypeBreakdown;
