import { CustomerType } from "@/lib/types";
import { getCurrentMonthRange } from "@/lib/util";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Customer, prisma } from "@repo/database";
import moment from "moment";

const customerTypeMap: Record<
  CustomerType,
  { label: string; field: keyof Customer }
> = {
  Retailer: { label: "Total Retailers", field: "customerType" },
  Vendor: { label: "Total Vendors", field: "customerType" },
  Fleet: { label: "Total Fleets", field: "customerType" },
  Other: { label: "Uncategorized", field: "customerType" },
};

const CustomerTypeCard = async ({
  type,
  dateRange,
  dateType,
}: {
  type: CustomerType;
  dateRange: { startDate: Date; endDate: Date };
  dateType: string;
}) => {
  const { startDate, endDate } = dateRange;

  const customerTypeData = customerTypeMap[type];

  const totalCustomerType = await prisma.customer.count({
    where: {
      companyId: "odetail",
      customerType: type,
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  return (
    <div className="rounded-md bg-odetailBlack-dark p-4 flex-1 min-w-[130px] ">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-odetailBlue">
          {dateType === "allTime"
            ? "All Time"
            : dateType === "lastMonth" || dateType === "currentMonth"
              ? moment(startDate).format("MM/YYYY")
              : `${moment(startDate).format("MM/YYYY")} – ${moment(endDate).format("MM/YYYY")}`}
        </span>
        <FontAwesomeIcon icon={faEllipsis} className="text-white w-5" />
      </div>
      <h1 className="text-xl font-semibold my-4 text-white">
        {totalCustomerType}
      </h1>
      <h2 className="capitalize text-xs font-medium text-gray-200">
        {customerTypeData.label}
      </h2>
    </div>
  );
};

export default CustomerTypeCard;
