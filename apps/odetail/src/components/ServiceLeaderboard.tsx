import { prisma } from "@repo/database";
import Link from "next/link";

const medals = ["🥇", "🥈", "🥉"];

const rankBorderColors = [
  "border-yellow-400",
  "border-gray-400",
  "border-orange-400",
];

type SortBy = "revenue" | "jobs";

const ServiceLeaderboard = async ({
  startDate,
  endDate,
  sortBy = "revenue",
  searchParams,
}: {
  startDate: string;
  endDate: string;
  sortBy?: SortBy;
  searchParams: { [key: string]: string | undefined };
}) => {
  const raw = await prisma.service.groupBy({
    by: ["serviceType"],
    _count: { id: true },
    _sum: { price: true },
    where: {
      companyId: "odetail",
      createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    orderBy:
      sortBy === "jobs"
        ? { _count: { id: "desc" } }
        : { _sum: { price: "desc" } },
  });

  const maxRevenue = raw[0]?._sum.price ?? 1;
  const maxJobs = raw[0]?._count.id ?? 1;

  return (
    <div className="bg-odetailBlack-dark rounded-xl p-5 h-full flex flex-col">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-lg font-bold text-white">Service Leaderboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {sortBy === "jobs" ? "Ranked by number of jobs" : "Ranked by total revenue"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-odetailBlack p-1 rounded-full">
          <Link href={{ pathname: "/admin", query: { ...searchParams, serviceSort: "revenue" } }}>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium block transition-all ${
                sortBy === "revenue" ? "bg-odetailBlue text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Revenue
            </span>
          </Link>
          <Link href={{ pathname: "/admin", query: { ...searchParams, serviceSort: "jobs" } }}>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium block transition-all ${
                sortBy === "jobs" ? "bg-odetailBlue text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Jobs
            </span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {raw.map((item, i) => {
          const revenue = item._sum.price ?? 0;
          const jobs = item._count.id;
          const pct =
            sortBy === "jobs"
              ? Math.round((jobs / maxJobs) * 100)
              : Math.round((revenue / maxRevenue) * 100);
          const isTop3 = i < 3;

          return (
            <div
              key={item.serviceType}
              className={`flex items-center gap-3 p-3 rounded-lg bg-odetailBlack-light ${isTop3 ? `border-l-2 ${rankBorderColors[i]}` : ""}`}
            >
              <div className="w-8 text-center flex-shrink-0">
                {isTop3 ? (
                  <span className="text-lg">{medals[i]}</span>
                ) : (
                  <span className="text-gray-500 text-sm font-bold">#{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-white truncate pr-2">
                    {item.serviceType}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold ${sortBy === "jobs" ? "text-odetailBlue" : "text-gray-500"}`}>
                      {jobs} job{jobs !== 1 ? "s" : ""}
                    </span>
                    <span className={`text-sm font-bold ${sortBy === "revenue" ? "text-odetailGreen" : "text-gray-500"}`}>
                      ${revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-odetailBlack rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      sortBy === "jobs"
                        ? "bg-gradient-to-r from-odetailBlue to-odetailBlue/60"
                        : "bg-gradient-to-r from-odetailBlue to-odetailGreen"
                    }`}
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

export default ServiceLeaderboard;
