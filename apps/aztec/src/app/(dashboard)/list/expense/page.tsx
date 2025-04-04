import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import SummaryRow from "@/components/SummaryRow";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { SummaryType } from "@/lib/types";
import { formatDate } from "@/lib/util";
import {
  faFilter,
  faPencil,
  faPlus,
  faSort,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Prisma, Expense, prisma } from "@repo/database";
import Link from "next/link";

// Type Definition for Billing List
type ExpenseList = Expense;

const ExpenseListPage = async ({
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
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Cost",
      accessor: "cost",
      className: "hidden md:table-cell",
    },
    {
      header: "Payment Type",
      accessor: "paymentType",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  // Render Row for Each Billing Item
  const renderRow = (item: ExpenseList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-aztecBlack-light text-sm hover:bg-aztecBlue text-white"
    >
      {/* Customer Name */}
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">#{item.id}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.description}</td>
      <td className="hidden md:table-cell">{formatDate(item.date)}</td>
      <td className="hidden md:table-cell">${item.cost}</td>
      <td className="hidden md:table-cell">{item.paymentType}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="expense"
            type={{ label: "update", icon: faPencil }}
            id={item.id}
            data={item}
          />
          <FormModal
            table="expense"
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
  if (dateRange === "lastMonth") {
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
  const query: Prisma.ExpenseWhereInput = {
    companyId: "aztec",
    createdAt: { gte: startDate, lte: endDate },
  };
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "id":
            query.id = Number(value);
            break;
          case "search":
            const numericValue = Number(value);

            query.OR = [];

            if (!isNaN(numericValue)) {
              query.OR.push({ id: { equals: numericValue } });
            }

            query.OR.push(
              {
                paymentType: {
                  contains: value,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: value,
                  mode: "insensitive",
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
  const [data, count] = await prisma.$transaction([
    prisma.expense.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.expense.count({ where: query }),
  ]);

  return (
    <div className="flex m-4 gap-4 flex-col">
      <div className="flex items-center gap-4 self-end px-4 text-sm font-semibold">
        <Link
          href={{
            pathname: "/list/expense",
            query: { ...searchParams, dateRange: "lastMonth" },
          }}
        >
          <button
            className={`p-2 rounded ${dateRange === "lastMonth" ? "bg-aztecBlue text-white" : "bg-gray-200 text-black"}`}
          >
            Last Month
          </button>
        </Link>
        <Link
          href={{
            pathname: "/list/expense",
            query: { ...searchParams, dateRange: "currentMonth" },
          }}
        >
          <button
            className={`p-2 rounded ${dateRange === "currentMonth" ? "bg-aztecBlue text-white" : "bg-gray-200 text-black"}`}
          >
            Current Month
          </button>
        </Link>
        <Link
          href={{
            pathname: "/list/expense",
            query: { ...searchParams, dateRange: "ytd" },
          }}
        >
          <button
            className={`p-2 rounded ${dateRange === "ytd" ? "bg-aztecBlue text-white" : "bg-gray-200 text-black"}`}
          >
            YTD
          </button>
        </Link>
      </div>

      <div className="bg-aztecBlack-dark p-4 rounded-md flex-1 mt-0">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold text-white">
            All Expenses
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
              <FormModal
                table="expense"
                type={{ label: "create", icon: faPlus }}
              />
            </div>
          </div>
        </div>
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={data} />
        <SummaryRow
          summaryType={SummaryType.Expense}
          dateRange={{ startDate, endDate }}
        />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ExpenseListPage;
