import CustomerTypeCard from "@/components/CustomerTypeCard";
import DateRangeForm from "@/components/DateRangeForm";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { CustomerType } from "@/lib/types";
import { formatDate, formatPhoneNumber } from "@/lib/util";
import { auth } from "@clerk/nextjs/server";
import {
  faEye,
  faFilter,
  faPlus,
  faSort,
  faSortDown,
  faSortUp,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Customer, Prisma, prisma } from "@repo/database";
import Link from "next/link";

const CustomerListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: (
        <Link
          href={{
            pathname: "/list/customers",
            query: {
              ...searchParams,
              sortColumn: "customerType",
              sortOrder:
                searchParams.sortColumn === "customerType" &&
                searchParams.sortOrder === "asc"
                  ? "desc"
                  : "asc",
            },
          }}
        >
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Customer Type</span>
            {searchParams.sortColumn === "customerType" ? (
              searchParams.sortOrder === "asc" ? (
                <FontAwesomeIcon icon={faSortUp} />
              ) : (
                <FontAwesomeIcon icon={faSortDown} />
              )
            ) : (
              <FontAwesomeIcon icon={faSort} />
            )}
          </div>
        </Link>
      ),
      accessor: "customerType",
      className: "hidden md:table-cell",
    },
    {
      header: "Last Visit",
      accessor: "lastVisit",
      className: "hidden lg:table-cell",
    },
    {
      header: "Total Visits",
      accessor: "returnCounter",
      className: "hidden lg:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: Customer) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-aztecBlack-light text-sm text-white hover:bg-aztecBlue"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.firstName} {item.lastName}
          </h3>
          <p className="text-xs text-gray-400">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{formatPhoneNumber(item.phone)}</td>
      <td className="hidden md:table-cell">{item.customerType}</td>
      <td className="hidden md:table-cell">{formatDate(item.lastVisit)}</td>
      <td className="hidden md:table-cell">{item.returnCounter}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/customers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-aztecGreen">
              <FontAwesomeIcon icon={faEye} className="text-white w-5" />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal
              table="customer"
              type={{ label: "delete", icon: faTrashCan }}
              id={item.id}
            />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const dateRange = searchParams.dateRange || "allTime";
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
  } else if (dateRange === "allTime") {
    startDate = new Date(0);
    endDate = now;
  } else {
    // currentMonth
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = now;
  }

  const p = page ? parseInt(page) : 1;

  const query: Prisma.CustomerWhereInput = {
    companyId: "aztec",
    createdAt: { gte: startDate, lte: endDate },
  };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { email: { contains: value, mode: "insensitive" } },
              { firstName: { contains: value, mode: "insensitive" } },
              { phone: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const orderBy =
    searchParams.sortColumn && searchParams.sortOrder
      ? { [searchParams.sortColumn]: searchParams.sortOrder }
      : undefined;

  const [data, count] = await prisma.$transaction([
    prisma.customer.findMany({
      where: query,
      orderBy: orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.customer.count({ where: query }),
  ]);

  return (
    <div className="flex m-4 gap-4 flex-col">
      <div className="flex items-center gap-4 px-4 text-sm font-semibold justify-between">
        <div className="flex items-center gap-4 self-end">
          <Link
            href={{
              pathname: "/list/customers",
              query: { ...searchParams, dateRange: "allTime" },
            }}
          >
            <button
              className={`p-2 rounded ${dateRange === "allTime" ? "bg-aztecBlue text-white" : "bg-gray-200 text-black"}`}
            >
              All Time
            </button>
          </Link>
          <Link
            href={{
              pathname: "/list/customers",
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
              pathname: "/list/customers",
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
              pathname: "/list/customers",
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
        <div className="flex items-center gap-4 self-end">
          <DateRangeForm />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap w-full gap-4">
          <CustomerTypeCard
            type={CustomerType.Retailer}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
          <CustomerTypeCard
            type={CustomerType.Vendor}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
          <CustomerTypeCard
            type={CustomerType.Fleet}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />

          <CustomerTypeCard
            type={CustomerType.Other}
            dateRange={{ startDate: startDate, endDate: endDate }}
            dateType={dateRange}
          />
        </div>
      </div>
      <div className="bg-aztecBlack-dark p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold text-white">
            All Customers
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
              {role === "admin" && (
                <FormModal
                  table="customer"
                  type={{ label: "create", icon: faPlus }}
                />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={data} />
        {/* <SummaryRow
          summaryType={SummaryType.Billing}
          dateRange={{ startDate, endDate }}
        /> */}
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default CustomerListPage;
