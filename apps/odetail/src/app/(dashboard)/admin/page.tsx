import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import CountChartContainer from "@/components/CountChartContainer";
import ServiceLeaderboard from "@/components/ServiceLeaderboard";
import TopCustomers from "@/components/TopCustomers";
import InvoiceStatusBreakdown from "@/components/InvoiceStatusBreakdown";
import DashboardFilter from "@/components/DashboardFilter";
import OutstandingReceivables from "@/components/OutstandingReceivables";
import ConversionRate from "@/components/ConversionRate";
import AverageInvoiceValue from "@/components/AverageInvoiceValue";
import CustomerRetention from "@/components/CustomerRetention";
import VehicleTypeBreakdown from "@/components/VehicleTypeBreakdown";
import { getDateRange, type Period } from "@/lib/util";

const periodLabels: Record<Period, string> = {
  today: "Today",
  thisWeek: "This Week",
  currentMonth: "This Month",
  lastMonth: "Last Month",
  ytd: "YTD",
};

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const period = (searchParams.period as Period) ?? "currentMonth";
  const { startDate, endDate } = getDateRange(period);
  const periodLabel = periodLabels[period];

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        {/* HEADER WITH FILTER */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <DashboardFilter active={period} searchParams={searchParams} />
        </div>

        {/* STAT CARDS */}
        {/* <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="employee" startDate={startDate} endDate={endDate} periodLabel={periodLabel} />
          <UserCard type="customer" startDate={startDate} endDate={endDate} periodLabel={periodLabel} />
          <UserCard type="appointment" startDate={startDate} endDate={endDate} periodLabel={periodLabel} />
          <UserCard type="revenue" startDate={startDate} endDate={endDate} periodLabel={periodLabel} />
        </div> */}

        {/* QUICK STATS ROW */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <OutstandingReceivables />
          <ConversionRate startDate={startDate} endDate={endDate} />
          <AverageInvoiceValue startDate={startDate} endDate={endDate} />
        </div>

        {/* LEADERBOARD + STATUS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/2">
            <ServiceLeaderboard
            startDate={startDate}
            endDate={endDate}
            sortBy={(searchParams.serviceSort as "revenue" | "jobs") ?? "revenue"}
            searchParams={searchParams}
          />
          </div>
          <div className="w-full lg:w-1/2">
            <InvoiceStatusBreakdown startDate={startDate} endDate={endDate} />
          </div>
        </div>

        {/* NET REVENUE DONUT + FINANCE LINE */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-[420px]">
            <CountChartContainer startDate={startDate} endDate={endDate} />
          </div>
          <div className="w-full lg:w-1/2 h-[420px]">
            <FinanceChartContainer />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <TopCustomers startDate={startDate} endDate={endDate} />
        <CustomerRetention startDate={startDate} endDate={endDate} />
        <VehicleTypeBreakdown startDate={startDate} endDate={endDate} />
        <EventCalendarContainer searchParams={searchParams} />
      </div>
    </div>
  );
};

export default AdminPage;
