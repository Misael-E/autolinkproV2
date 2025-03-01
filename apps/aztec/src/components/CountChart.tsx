"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

type CountChartProps = {
  data: {
    trueNet: number | null;
    jobNet: number | null;
    subNet: number | null;
  };
};

const CountChart = ({ data: { trueNet, jobNet, subNet } }: CountChartProps) => {
  const data = [
    {
      name: "True Net",
      count: trueNet ?? 0,
      fill: "#1194e4",
    },
    {
      name: "Job Net",
      count: jobNet ?? 0,
      fill: "#39b972",
    },
    {
      name: "Sub Net",
      count: subNet ?? 0,
      fill: "#FFA500",
    },
  ];

  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={32}
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CountChart;
