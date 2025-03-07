import { BillingType } from "@/lib/types";
import { getCurrentMonthRange } from "@/lib/util";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Revenue, prisma } from "@repo/database";
import moment from "moment";

const billingTypeMap: Record<
  BillingType,
  { label: string; field: keyof Revenue }
> = {
  totalMaterials: { label: "Total Materials", field: "materialCost" },
  totalWindshield: { label: "Total Windshields", field: "totalWindshields" },
  totalGas: { label: "Total Gas", field: "gasCost" },
  jobNet: { label: "Job Net", field: "jobNet" },
  subNet: { label: "Sub Net", field: "subNet" },
  trueNet: { label: "True Net", field: "trueNet" },
};

const BillingCard = async ({ type }: { type: BillingType }) => {
  const { startDate, endDate } = getCurrentMonthRange();

  const billingData = billingTypeMap[type];

  const [expensesForMonth, revenueForMonth] = await Promise.all([
    prisma.expense.groupBy({
      by: ["isWage", "isRent"],
      _sum: { cost: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        companyId: "aztec",
      },
    }),
    prisma.revenue.aggregate({
      _sum: { [billingData.field]: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        companyId: "aztec",
      },
    }),
  ]);

  const totalExpenses = expensesForMonth
    .filter((e) => !e.isWage && !e.isRent)
    .reduce((sum, e) => sum + (e._sum.cost ?? 0), 0);

  const totalWages = expensesForMonth
    .filter((e) => e.isWage)
    .reduce((sum, e) => sum + (e._sum.cost ?? 0), 0);

  const totalRent = expensesForMonth
    .filter((e) => e.isRent)
    .reduce((sum, e) => sum + (e._sum.cost ?? 0), 0);

  const totalRevenue = revenueForMonth._sum[billingData.field] ?? 0;

  let displayValue = totalRevenue as number;

  if (type === "subNet") {
    displayValue = totalRevenue - totalExpenses;
  }

  if (type === "trueNet") {
    displayValue = totalRevenue - totalWages - totalRent;
  }

  return (
    <div className="rounded-md bg-aztecBlack-dark p-4 flex-1 min-w-[130px] ">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-aztecBlue">
          {moment().format("YYYY/MM")}
        </span>
        <FontAwesomeIcon icon={faEllipsis} className="text-white w-5" />
      </div>
      <h1
        className={`text-xl font-semibold my-4 ${
          billingData.field === "totalWindshields"
            ? "text-white"
            : displayValue < 0
              ? "text-red-600"
              : "text-aztecGreen"
        }`}
      >
        {billingData.field !== "totalWindshields" && displayValue < 0 && "-"}
        {billingData.field === "totalWindshields"
          ? displayValue
          : `$${Math.abs(displayValue)}`}
      </h1>
      <h2 className="capitalize text-xs font-medium text-gray-200">
        {billingData.label}
      </h2>
    </div>
  );
};

export default BillingCard;
