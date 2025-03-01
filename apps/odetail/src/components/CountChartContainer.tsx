import CountChart from "./CountChart";
import { prisma } from "@repo/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

const CountChartContainer = async () => {
  const data = await prisma.revenue.aggregate({
    _sum: {
      trueNet: true,
      jobNet: true,
      subNet: true,
    },
    where: { companyId: "odetail" },
  });

  const { jobNet = 0, subNet = 0, trueNet = 0 } = data._sum || {};
  return (
    <div className="bg-odetailBlack-dark rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-white">Total Revenue</h1>
        <FontAwesomeIcon icon={faEllipsis} className="text-white w-5" />
      </div>
      {/* CHART */}
      <CountChart data={{ jobNet, subNet, trueNet }} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-16 text-white">
        {[
          { name: "Job Net", value: jobNet ?? 0, color: "bg-odetailGreen" },
          { name: "Sub Net", value: subNet ?? 0, color: "bg-odetailOrange" },
          { name: "True Net", value: trueNet ?? 0, color: "bg-odetailBlue" },
        ].map(({ name, value, color }) => (
          <div key={name} className="flex flex-col gap-1 items-center">
            <div className={`w-5 h-5 rounded-full ${color}`} />
            <h1 className={`font-semibold ${value < 0 ? "text-red-600" : ""}`}>
              {value < 0
                ? `- $${Math.abs(value)}`
                : `$${(value ?? 0).toLocaleString()}`}
            </h1>
            <h2 className="text-xs text-gray-300">{name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountChartContainer;
