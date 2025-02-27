const BillingPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap"></div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/2 h-[450px]"></div>
          {/* REVENUE BAR CHART */}
          <div className="w-full lg:w-1/2 h-[450px]"></div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]"></div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8"></div>
    </div>
  );
};

export default BillingPage;
