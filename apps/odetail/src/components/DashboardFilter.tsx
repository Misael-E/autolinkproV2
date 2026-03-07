import Link from "next/link";
import type { Period } from "@/lib/util";

const periods: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "currentMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "ytd", label: "YTD" },
];

const DashboardFilter = ({
  active,
  searchParams,
}: {
  active: Period;
  searchParams: { [key: string]: string | undefined };
}) => {
  return (
    <div className="flex items-center gap-1 bg-odetailBlack-dark p-1 rounded-full">
      {periods.map((p) => (
        <Link
          key={p.value}
          href={{ pathname: "/admin", query: { ...searchParams, period: p.value } }}
        >
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-medium block transition-all duration-200 ${
              active === p.value
                ? "bg-odetailBlue text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {p.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default DashboardFilter;
