import FormModal from "@/components/FormModal";
import { TableSearch, Pagination, Table } from "@repo/ui";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { calculateTotalPrice, formatPhoneNumber } from "@/lib/util";
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
import { Customer, Prisma, Quote, Service, prisma } from "@repo/database";
import { resolveLocation } from "@/lib/resolveLocation";
import { QuoteStatusEnum } from "@repo/types";
import Link from "next/link";

type QuoteList = Quote & { customer: Customer } & { services: Service[] };

const QuoteListPage = async ({
  params,
  searchParams,
}: {
  params: { location: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const location = await resolveLocation(params.location);
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    {
      header: (
        <Link
          href={{
            pathname: `/${params.location}/list/quotes`,
            query: {
              ...searchParams,
              sortColumn: "status",
              sortOrder:
                searchParams.sortColumn === "status" && searchParams.sortOrder === "asc"
                  ? "desc"
                  : "asc",
            },
          }}
        >
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Status</span>
            {searchParams.sortColumn === "status" ? (
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
      accessor: "status",
      className: "hidden lg:table-cell",
    },
    { header: "Codes", accessor: "codes", className: "hidden lg:table-cell" },
    { header: "Amount", accessor: "amount", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: QuoteList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-aztecBlack-light text-sm hover:bg-aztecBlue text-white"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.customer.firstName} {item.customer.lastName}
          </h3>
          <a href={`tel:${item.customer.phone}`} className="text-xs text-aztecBlue lg:hidden">
            {formatPhoneNumber(item.customer.phone)}
          </a>
          <p className="text-xs text-gray-300">#{item.quoteNumber}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{formatPhoneNumber(item.customer.phone)}</td>
      <td className="hidden md:table-cell">
        <div
          className={`hidden md:table-cell ${
            item.status === QuoteStatusEnum.Accepted
              ? "bg-aztecGreen text-white"
              : item.status === QuoteStatusEnum.Sent
                ? "bg-yellow-500 text-black"
                : item.status === QuoteStatusEnum.Declined
                  ? "bg-red-500 text-white"
                  : "bg-gray-500 text-white"
          } px-4 py-2 rounded-lg`}
        >
          {item.status}
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.services.map((s) => s.code).join(", ")}
      </td>
      <td className="hidden md:table-cell text-lg font-semibold">
        ${calculateTotalPrice(item.services).toFixed(2)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="quote"
            type={{ label: "update", icon: faEye }}
            data={item}
            id={item.id}
          />
          {role === "admin" && (
            <FormModal
              table="quote"
              type={{ label: "delete", icon: faTrashCan }}
              id={item.id}
            />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.QuoteWhereInput = {
    companyId: "aztec",
    locationId: location.id,
  };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { customer: { firstName: { contains: value, mode: "insensitive" } } },
              { customer: { phone: { contains: value, mode: "insensitive" } } },
              { services: { some: { code: { contains: value, mode: "insensitive" } } } },
              { quoteNumber: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "status":
            query.status = value;
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
      : { createdAt: "desc" as const };

  const [data, count] = await prisma.$transaction([
    prisma.quote.findMany({
      where: query,
      include: { customer: true, services: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.quote.count({ where: query }),
  ]);

  return (
    <div className="bg-aztecBlack-dark p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between text-white">
        <h1 className="hidden md:block text-lg font-semibold">All Quotes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-aztecBlue">
              <FontAwesomeIcon icon={faFilter} className="text-white w-5" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-aztecBlue">
              <FontAwesomeIcon icon={faSort} className="text-white w-5" />
            </button>
            <FormModal table="quote" type={{ label: "create", icon: faPlus }} />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} range={10} />
    </div>
  );
};

export default QuoteListPage;
