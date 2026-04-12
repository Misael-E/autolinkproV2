import FinanceChartContainer from "@/components/FinanceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import CountChartContainer from "@/components/CountChartContainer";
import ServiceLeaderboard from "@/components/ServiceLeaderboard";
import TopCustomers from "@/components/TopCustomers";
import InvoiceStatusBreakdown from "@/components/InvoiceStatusBreakdown";
import { DashboardFilter } from "@repo/ui";
import OutstandingReceivables from "@/components/OutstandingReceivables";
import ConversionRate from "@/components/ConversionRate";
import AverageInvoiceValue from "@/components/AverageInvoiceValue";
import CustomerRetention from "@/components/CustomerRetention";
import VehicleTypeBreakdown from "@/components/VehicleTypeBreakdown";
import { resolveLocation } from "@/lib/resolveLocation";
import { getDateRange, type Period } from "@/lib/util";

const periodLabels: Record<Period, string> = {
  today: "Today",
  thisWeek: "This Week",
  currentMonth: "This Month",
  lastMonth: "Last Month",
  ytd: "YTD",
};

const AdminPage = async ({
  params,
  searchParams,
}: {
  params: { location: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const location = await resolveLocation(params.location);
  const period = (searchParams.period as Period) ?? "currentMonth";
  const { startDate, endDate } = getDateRange(period);
  const periodLabel = periodLabels[period];

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        {/* HEADER WITH FILTER */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-[11px] text-gray-500 mt-0.5 capitalize">{location.name ?? params.location}</p>
          </div>
          <DashboardFilter
            active={period}
            basePath={`/${params.location}`}
            searchParams={searchParams}
          />
        </div>

        {/* QUICK STATS ROW */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <OutstandingReceivables locationId={location.id} />
          <ConversionRate startDate={startDate} endDate={endDate} locationId={location.id} />
          <AverageInvoiceValue startDate={startDate} endDate={endDate} locationId={location.id} />
        </div>

        {/* LEADERBOARD + STATUS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/2">
            <ServiceLeaderboard
              startDate={startDate}
              endDate={endDate}
              sortBy={(searchParams.serviceSort as "revenue" | "jobs") ?? "revenue"}
              locationId={location.id}
              locationSlug={params.location}
              searchParams={searchParams}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <InvoiceStatusBreakdown startDate={startDate} endDate={endDate} locationId={location.id} />
          </div>
        </div>

        {/* REVENUE SUMMARY + FINANCE LINE */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-[420px]">
            <CountChartContainer
              locationId={location.id}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div className="w-full lg:w-1/2 h-[420px]">
            <FinanceChartContainer locationId={location.id} />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <TopCustomers startDate={startDate} endDate={endDate} locationId={location.id} />
        <CustomerRetention startDate={startDate} endDate={endDate} locationId={location.id} />
        <VehicleTypeBreakdown startDate={startDate} endDate={endDate} locationId={location.id} />
        <EventCalendarContainer searchParams={searchParams} locationId={location.id} />
      </div>
    </div>
  );
};

export default AdminPage;
