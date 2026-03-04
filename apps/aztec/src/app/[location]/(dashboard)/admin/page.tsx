import RevenueBarChart from "@/components/RevenueBarChart";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import CountChartContainer from "@/components/CountChartContainer";
import { resolveLocation } from "@/lib/resolveLocation";

const AdminPage = async ({
  params,
  searchParams,
}: {
  params: { location: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const location = await resolveLocation(params.location);

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="employee" locationId={location.id} />
          <UserCard type="customer" locationId={location.id} />
          <UserCard type="appointment" locationId={location.id} />
          <UserCard type="revenue" locationId={location.id} />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/2 h-[450px]">
            <CountChartContainer locationId={location.id} />
          </div>
          {/* REVENUE BAR CHART */}
          <div className="w-full lg:w-1/2 h-[450px]">
            <RevenueBarChart />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} locationId={location.id} />
      </div>
    </div>
  );
};

export default AdminPage;
