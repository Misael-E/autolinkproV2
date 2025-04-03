import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import SummaryRow from "@/components/SummaryRow";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatDate } from "@/lib/util";
import {
  faEye,
  faFilter,
  faPencil,
  faPlus,
  faSort,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Revenue, Service, Statement, Prisma, prisma } from "@repo/database";
import Link from "next/link";

// Type Definition for Statement List
type StatementList = Statement & {
  revenue?: Revenue & {
    invoice?: Service;
  };
};

const StatementListPage = async ({
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
      header: "Distributor",
      accessor: "distributor",
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
  const renderRow = (item: StatementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-odetailBlack-light text-sm hover:bg-odetailBlue text-white"
    >
      {/* Customer Name */}
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{`#${item.id}`}</h3>
          {/* <p className="text-xs text-gray-300">
            {item.service?.vehicleType ? item.service?.vehicleType : "N/A"}
          </p> */}
        </div>
      </td>

      {/* Invoice Date */}
      <td className="hidden md:table-cell">
        {item.startDate ? formatDate(item.startDate as Date) : "Unknown Date"}
      </td>

      {/* Service Codes */}
      <td className="hidden md:table-cell">{item.distributor}</td>

      {/* Total Price Gst */}
      <td className="hidden md:table-cell">${item.grossSalesGst}</td>

      {/* Cost Before GST */}
      <td className="hidden md:table-cell">${item.costBeforeGst}</td>

      {/* Cost After GST */}
      <td className="hidden md:table-cell">${item.costAfterGst?.toFixed(2)}</td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/statements/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-odetailGreen">
              <FontAwesomeIcon icon={faEye} className="text-white w-5" />
            </button>
          </Link>
          <FormModal
            table="statement"
            type={{ label: "delete", icon: faTrashCan }}
            id={item.id}
          />
        </div>
      </td>
    </tr>
  );

  // Extract Query Parameters
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Define Filters
  const statementQuery: Prisma.StatementWhereInput = { companyId: "odetail" };
  const invoiceQuery: Prisma.InvoiceWhereInput = { companyId: "odetail" };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "customerId":
            invoiceQuery.customerId = value;
            break;
          case "search":
            const numericValue = Number(value);

            statementQuery.OR = [];

            if (!isNaN(numericValue)) {
              statementQuery.OR.push({ id: { equals: numericValue } });
            }

            // statementQuery.OR.push(
            //   {
            //     service: {
            //       invoice: {
            //         customer: {
            //           firstName: { contains: value, mode: "insensitive" },
            //         },
            //       },
            //     },
            //   }
            // );
            break;
          default:
            break;
        }
      }
    }
  }

  // Fetch Data from Prisma
  const [data, count] = await prisma.$transaction([
    prisma.statement.findMany({
      where: statementQuery,
      include: {
        revenues: {
          include: {
            service: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.statement.count({ where: statementQuery }),
  ]);

  return (
    <div className="flex m-4 gap-4 flex-col">
      <div className="bg-odetailBlack-dark p-4 rounded-md flex-1 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold text-white">
            All Statements
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-odetailBlue">
                <FontAwesomeIcon icon={faFilter} className="text-white w-5" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-odetailBlue">
                <FontAwesomeIcon icon={faSort} className="text-white w-5" />
              </button>
              <FormModal
                table="statement"
                type={{ label: "create", icon: faPlus }}
              />
            </div>
          </div>
        </div>

        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={data} />
        <SummaryRow type={{ summaryType: "statement" }} />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default StatementListPage;
