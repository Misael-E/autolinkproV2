"use client";

import { ResponsiveContainer, Pie, PieChart, Cell } from "recharts";

type PieChartProps = {
  data: {
    trueNet: number | null;
    jobNet: number | null;
    subNet: number | null;
  };
};

const RevenuePieChart = ({
  data: { trueNet, jobNet, subNet },
}: PieChartProps) => {
  const data = [
    {
      name: "True Net",
      value: trueNet,
      color: "#1194e4",
    },
    {
      name: "Job Net",
      value: jobNet,
      color: "#39b972",
    },
    {
      name: "Sub Net",
      value: subNet,
      color: "#FFA500",
    },
  ];

  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="70%"
            data={data}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenuePieChart;
