import BillingCard from "@/components/BillingCard";
import BillingSummaryRow from "@/components/SummaryRow";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { BillingType, SummaryType } from "@/lib/types";
import { formatDate } from "@/lib/util";
import {
  faFilter,
  faPencil,
  faSort,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Revenue, Service, Customer, Prisma, prisma } from "@repo/database";
import SummaryRow from "@/components/SummaryRow";
import Link from "next/link";
import dynamic from "next/dynamic";
const DateRangeForm = dynamic(() => import("@/components/DateRangeForm"), {
  ssr: false,
});

// Type Definition for Billing List
type BillingList = Revenue & {
  service?: Service & {
    invoice?: Service & {
      customer?: Customer;
    };
  };
};

const BillingListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Table Columns
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Date",
      accessor: "createdAt",
      className: "hidden md:table-cell",
    },
    {
      header: "Code",
      accessor: "distributor",
      className: "hidden md:table-cell",
    },
    {
      header: "Price",
      accessor: "total",
      className: "hidden md:table-cell",
    },
    {
      header: "GST",
      accessor: "grossSalesGst",
      className: "hidden md:table-cell",
    },
    {
      header: "Before GST",
      accessor: "costBeforeGst",
      className: "hidden md:table-cell",
    },
    {
      header: "After GST",
      accessor: "costAfterGst",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  // Render Row for Each Billing Item
  const renderRow = (item: BillingList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-odetailBlack-light text-sm hover:bg-odetailBlue text-white"
    >
      {/* Customer Name */}
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.service?.invoice?.customer?.firstName
              ? `${item.service?.invoice?.customer?.firstName} ${item.service?.invoice?.customer?.lastName}`
              : "Unknown Customer"}
          </h3>
          <p className="text-xs text-gray-300">
            {item.service?.vehicleType ? item.service?.vehicleType : "N/A"}
          </p>
        </div>
      </td>

      {/* Invoice Date */}
      <td className="hidden md:table-cell">
        {formatDate(item.service?.createdAt as Date)}
      </td>

      {/* Service Codes */}
      <td className="hidden md:table-cell">{item.service?.code}</td>

      {/* Total Price */}
      <td className="hidden md:table-cell">${item.grossSales}</td>

      {/* Total Price Gst */}
      <td className="hidden md:table-cell">${item.grossSalesGst}</td>

      {/* Cost Before GST */}
      <td className="hidden md:table-cell">${item.costBeforeGst}</td>

      {/* Cost After GST */}
      <td className="hidden md:table-cell">${item.costAfterGst?.toFixed(2)}</td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="revenue"
            type={{ label: "update", icon: faPencil }}
            id={item.id}
            data={item}
          />
          <FormModal
            table="revenue"
            type={{ label: "delete", icon: faTrashCan }}
            id={item.id}
          />
        </div>
      </td>
    </tr>
  );

  // Extract Query Parameters
  const { page, ...queryParams } = searchParams;
  const dateRange = searchParams.dateRange || "currentMonth";
  let startDate: Date, endDate: Date;
  const now = new Date();

  if (dateRange === "custom" && searchParams.start && searchParams.end) {
    startDate = new Date(searchParams.start);
    endDate = new Date(searchParams.end);
    console.log(startDate, endDate);
  } else if (dateRange === "lastMonth") {
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(firstDayCurrentMonth.getTime() - 1);
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  } else if (dateRange === "ytd") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = now;
  } else {
    // currentMonth
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = now;
  }

  const p = page ? parseInt(page) : 1;

  // Define Filters
  const revenueQuery: Prisma.RevenueWhereInput = {
    companyId: "odetail",
    createdAt: { gte: startDate, lte: endDate },
  };
  const invoiceQuery: Prisma.InvoiceWhereInput = {
    companyId: "odetail",
    createdAt: { gte: startDate, lte: endDate },
  };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "customerId":
            invoiceQuery.customerId = value;
            break;
          case "search":
            const numericValue = Number(value);

            revenueQuery.OR = [];

            if (!isNaN(numericValue)) {
              revenueQuery.OR.push({ id: { equals: numericValue } });
            }

            revenueQuery.OR.push(
              {
                service: {
                  code: {
                    contains: value,
                    mode: "insensitive",
                  },
                },
              },
              {
                service: {
                  invoice: {
                    customer: {
                      firstName: { contains: value, mode: "insensitive" },
                    },
                  },
                },
              }
            );
            break;
          default:
            break;
        }
      }
    }
  }

  // Fetch Data from Prisma
  const [revenueData, count] = await prisma.$transaction([
    prisma.revenue.findMany({
      where: revenueQuery,
      include: {
        service: {
          include: {
            invoice: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.revenue.count({ where: revenueQuery }),
  ]);

  return (
    <div className="flex m-4 gap-4 flex-col">
      <div className="flex items-center gap-4 px-4 text-sm font-semibold justify-between">
        <div className="flex items-center gap-4 self-end">
          <Link
            href={{
              pathname: "/list/billing",
              query: { ...searchParams, dateRange: "lastMonth" },
            }}
          >
            <button
              className={`p-2 rounded ${dateRange === "lastMonth" ? "bg-odetailBlue text-white" : "bg-gray-200 text-black"}`}
            >
              Last Month
            </button>
          </Link>
          <Link
            href={{
              pathname: "/list/billing",
              query: { ...searchParams, dateRange: "currentMonth" },
            }}
          >
            <button
              className={`p-2 rounded ${dateRange === "currentMonth" ? "bg-odetailBlue text-white" : "bg-gray-200 text-black"}`}
            >
              Current Month
            </button>
          </Link>
          <Link
            href={{
              pathname: "/list/billing",
              query: { ...searchParams, dateRange: "ytd" },
            }}
          >
            <button
              className={`p-2 rounded ${dateRange === "ytd" ? "bg-odetailBlue text-white" : "bg-gray-200 text-black"}`}
            >
              YTD
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-4 self-end">
          <DateRangeForm />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap w-full gap-4">
          <BillingCard
            type={BillingType.JobNet}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
          <BillingCard
            type={BillingType.SubNet}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
          <BillingCard
            type={BillingType.TrueNet}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />

          <BillingCard
            type={BillingType.TotalMaterials}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
          <BillingCard
            type={BillingType.TotalWindshield}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
          <BillingCard
            type={BillingType.TotalShopFees}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
        </div>
      </div>

      <div className="bg-odetailBlack-dark p-4 rounded-md flex-1 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold text-white">
            All Billings
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-odetailBlue">
                <FontAwesomeIcon icon={faSort} className="text-white w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={revenueData} />
        <SummaryRow
          summaryType={SummaryType.Billing}
          dateRange={{ startDate, endDate }}
        />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default BillingListPage;
