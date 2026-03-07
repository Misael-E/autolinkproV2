"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { name: string; income: number; expense: number };

const FinanceChart = ({ data, year }: { data: DataPoint[]; year: number }) => {
  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const net = totalIncome - totalExpense;

  return (
    <div className="bg-odetailBlack-dark rounded-xl w-full h-full p-5 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h1 className="text-lg font-bold text-white">Income vs Expenses</h1>
          <p className="text-xs text-gray-500 mt-0.5">{year} — monthly breakdown</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${net >= 0 ? "bg-odetailGreen/20 text-odetailGreen" : "bg-red-500/20 text-red-400"}`}>
          Net {net >= 0 ? "+" : "-"}${Math.abs(net).toLocaleString()}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            tickMargin={8}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#212121",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === "income" ? "Income" : "Expenses",
            ]}
          />
          <Legend
            align="right"
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: "16px", fontSize: 12 }}
            formatter={(value) => (
              <span style={{ color: "#9ca3af" }}>
                {value === "income" ? "Income" : "Expenses"}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#39b972"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#39b972" }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#FFA500"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#FFA500" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
