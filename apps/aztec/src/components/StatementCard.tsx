import { StatementType } from "@/lib/types";
import { getCurrentMonthRange } from "@/lib/util";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Payment, Statement, prisma } from "@repo/database";
import moment from "moment";

const statementTypeMap: Record<
  StatementType,
  { label: string; field: keyof Statement | keyof Payment }
> = {
  totalAmountPaid: { label: "Total Amount Paid", field: "amount" },
  totalGrossSalesBeforeGst: {
    label: "Gross Sales Before GST",
    field: "costBeforeGst",
  },
  totalGrossSalesAfterGst: {
    label: "Gross Sales After GST",
    field: "costAfterGst",
  },
};

const StatementCard = async ({ type }: { type: StatementType }) => {
  const { startDate, endDate } = getCurrentMonthRange();

  const statementData = statementTypeMap[type];

  let paymentsForMonth, grossCosts;

  if (statementData.field === "amount") {
    paymentsForMonth = await prisma.payment.aggregate({
      _sum: { [statementData.field]: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    grossCosts = null;
  } else {
    grossCosts = await prisma.statement.aggregate({
      _sum: { [statementData.field]: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        companyId: "aztec",
      },
    });
  }

  const totalPayments = paymentsForMonth?._sum["amount"] ?? 0;
  const totalGross = grossCosts?._sum[statementData.field] ?? 0;

  let displayValue = (totalPayments as number) || (totalGross as number);

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
          displayValue < 0 ? "text-red-600" : "text-aztecGreen"
        }`}
      >
        {displayValue < 0 && "-"}
        {`$${Math.abs(displayValue).toFixed(2)}`}
      </h1>
      <h2 className="capitalize text-xs font-medium text-gray-200">
        {statementData.label}
      </h2>
    </div>
  );
};

export default StatementCard;
