import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatDate } from "@/lib/util";
import {
  faEye,
  faFilter,
  faPencil,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Prisma, Revenue, Customer, Service, Invoice } from "@prisma/client";
import Link from "next/link";

// Type Definition for Billing List
type BillingList = Revenue & {
  service?: Service & {
    invoice?: Invoice & {
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
      className="border-b border-gray-200 even:bg-aztecBlack-light text-sm hover:bg-aztecBlue text-white"
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

      {/* Cost Before GST */}
      <td className="hidden md:table-cell">${item.costBeforeGst}</td>

      {/* Cost After GST */}
      <td className="hidden md:table-cell">${item.costAfterGst}</td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="revenue"
            type={{ label: "update", icon: faPencil }}
            id={item.id}
            data={item}
          />
        </div>
      </td>
    </tr>
  );

  // Extract Query Parameters
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Define Filters
  const query: Prisma.InvoiceWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "customerId":
            query.customerId = value;
            break;
          case "search":
            query.id = { equals: Number(value) };
            break;
          default:
            break;
        }
      }
    }
  }

  // Fetch Data from Prisma
  const [revenueData] = await prisma.$transaction([
    prisma.revenue.findMany({
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
  ]);

  return (
    <div className="bg-aztecBlack-dark p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-white">
          All Billings
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-aztecBlue">
              <FontAwesomeIcon icon={faFilter} className="text-white w-5" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-aztecBlue">
              <FontAwesomeIcon icon={faSort} className="text-white w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={revenueData} />

      {/* PAGINATION */}
      <Pagination page={p} count={revenueData.length} />
    </div>
  );
};

export default BillingListPage;
