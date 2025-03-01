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

  const result = await prisma.revenue.aggregate({
    _sum: { [billingData.field]: true },
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      companyId: "odetail",
    },
  });

  // Get the total value and ensure it's not null
  const totalValue = result._sum[billingData.field] ?? 0;

  return (
    <div className="rounded-md bg-odetailBlack-dark p-4 flex-1 min-w-[130px] ">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-odetailBlue">
          {moment().format("YYYY/MM")}
        </span>
        <FontAwesomeIcon icon={faEllipsis} className="text-white w-5" />
      </div>
      <h1
        className={`text-xl font-semibold my-4 ${
          billingData.field === "totalWindshields"
            ? "text-white"
            : totalValue < 0
              ? "text-red-600"
              : "text-odetailGreen"
        }`}
      >
        {billingData.field !== "totalWindshields" && totalValue < 0 && "-"}
        {billingData.field === "totalWindshields"
          ? totalValue
          : `$${Math.abs(totalValue)}`}
      </h1>
      <h2 className="capitalize text-xs font-medium text-gray-200">
        {billingData.label}
      </h2>
    </div>
  );
};

export default BillingCard;
