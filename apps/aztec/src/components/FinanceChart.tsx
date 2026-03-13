"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { name: string; income: number; expense: number };

const FinanceChart = ({ data, year }: { data: DataPoint[]; year: number }) => {
  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const net = totalIncome - totalExpense;

  return (
    <div className="bg-aztecBlack-dark rounded-xl w-full h-full p-4 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-lg font-bold text-white">Income vs Expenses</h1>
          <p className="text-[11px] text-gray-500">Full year revenue vs expenses</p>
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            net >= 0 ? "bg-aztecGreen/20 text-aztecGreen" : "bg-red-400/20 text-red-400"
          }`}
        >
          Net {net >= 0 ? "+" : ""}${net.toLocaleString()}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid vertical={false} stroke="#2a2a2a" />
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
            contentStyle={{ backgroundColor: "#1a1a1a", border: "none", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#0ea5e9"
            strokeWidth={2.5}
            dot={false}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={false}
            name="Expenses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
