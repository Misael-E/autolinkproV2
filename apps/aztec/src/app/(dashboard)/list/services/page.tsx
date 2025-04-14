import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatDate } from "@/lib/util";
import {
  faFilter,
  faPencil,
  faPlus,
  faSort,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ServiceCatalog, Prisma, prisma } from "@repo/database";

// Type Definition for Billing List
type ServiceCatalogList = ServiceCatalog;

const ServiceListPage = async ({
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
      header: "Price",
      accessor: "price",
      className: "hidden md:table-cell",
    },
    {
      header: "Package",
      accessor: "isPackage",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "createdAt",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  // Render Row for Each Billing Item
  const renderRow = (item: ServiceCatalogList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-aztecBlack-light text-sm hover:bg-aztecBlue text-white"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold capitalize">{item.name}</h3>
          <p className="text-xs text-gray-300">#{item.id}</p>
        </div>
      </td>

      {/* Service Description */}
      <td className="hidden md:table-cell">{item.description}</td>

      {/* Service Price */}
      <td className="hidden md:table-cell">${item.price}</td>

      {/* Service package */}
      <td className="hidden md:table-cell">
        {item.isPackage ? "Included" : "Not Included"}
      </td>

      {/* Service Created At */}
      <td className="hidden md:table-cell">{formatDate(item.createdAt)}</td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="catalog"
            type={{ label: "update", icon: faPencil }}
            id={item.id}
            data={item}
          />
          <FormModal
            table="catalog"
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
  const query: Prisma.ServiceCatalogWhereInput = { companyId: "aztec" };
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            const numericValue = Number(value);

            query.OR = [];

            if (!isNaN(numericValue)) {
              query.OR.push({ id: { equals: numericValue } });
            }

            query.OR.push({
              name: { contains: value, mode: "insensitive" },
            });
            break;
          default:
            break;
        }
      }
    }
  }

  // Fetch Data from Prisma
  const [serviceCatalogData, count] = await prisma.$transaction([
    prisma.serviceCatalog.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.serviceCatalog.count({ where: query }),
  ]);

  return (
    <div className="bg-aztecBlack-dark p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between text-white">
        <h1 className="hidden md:block text-lg font-semibold">All Services</h1>
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
              table="catalog"
              type={{ label: "create", icon: faPlus }}
            />
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table
        columns={columns}
        renderRow={renderRow}
        data={serviceCatalogData}
      />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ServiceListPage;
