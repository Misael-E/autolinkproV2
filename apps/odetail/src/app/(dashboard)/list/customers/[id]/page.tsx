import DateRangeForm from "@/components/DateRangeForm";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { calculateTotalPrice, formatPhoneNumber } from "@/lib/util";
import {
  faCheckCircle,
  faClockRotateLeft,
  faEnvelope,
  faEye,
  faFilter,
  faLocationDot,
  faPencil,
  faPersonWalkingArrowLoopLeft,
  faPhone,
  faPlus,
  faSort,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Appointment,
  Customer,
  Invoice,
  Prisma,
  Service,
  prisma,
} from "@repo/database";
import moment from "moment";
import Link from "next/link";
import { notFound } from "next/navigation";

type SingleCustomer =
  | (Customer & { invoices: Invoice[] } & { appointments: Appointment[] } & {
      _count: { invoices: number; appointments: number };
    })
  | null;

type InvoiceList = Invoice & { customer: Customer } & {} & {
  services: Service[];
};

type AppointmentList = Appointment & { customer: Customer } & {} & {
  services: Service[];
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden lg:table-cell",
  },
  {
    header: "Codes",
    accessor: "codes",
    className: "hidden lg:table-cell",
  },
  {
    header: "Amount",
    accessor: "amount",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const appointmentColumns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: InvoiceList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-odetailBlack-light text-sm hover:bg-odetailBlue text-white"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">#{item.id}</h3>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.status}</td>
    <td className="hidden md:table-cell">
      {item.services.map((service) => service.code).join(",")}
    </td>
    <td className="hidden md:table-cell text-lg font-semibold">
      ${calculateTotalPrice(item.services).toFixed(2)}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/invoices/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-odetailGreen">
            <FontAwesomeIcon icon={faEye} className="text-white w-5" />
          </button>
        </Link>

        <FormModal
          table="invoice"
          type={{ label: "delete", icon: faTrashCan }}
          id={item.id}
        />
      </div>
    </td>
  </tr>
);

const renderAppointmentRow = (item: AppointmentList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-odetailBlack-light text-sm hover:bg-odetailBlue text-white"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">#{item.id}</h3>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.status}</td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal
          table="appointment"
          type={{ label: "update", icon: faEye }}
          data={item}
          id={item.id}
        />

        <FormModal
          table="invoice"
          type={{ label: "delete", icon: faTrashCan }}
          id={item.id}
        />
      </div>
    </td>
  </tr>
);

const SingleCustomerPage = async ({
  params,
  searchParams,
}: {
  params: { id: string; page?: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  // const { page, id } = params;
  const { id, page } = params;
  const dateRange = searchParams.dateRange || "currentMonth";
  let startDate: Date, endDate: Date;
  const now = new Date();

  if (dateRange === "custom" && searchParams?.start && searchParams?.end) {
    startDate = new Date(searchParams.start);
    endDate = new Date(searchParams.end);
  } else {
    // currentMonth
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = now;
  }

  const p = page ? parseInt(page) : 1;

  const invoiceQuery: Prisma.InvoiceWhereInput = {
    companyId: "odetail",
    createdAt: { gte: startDate, lte: endDate },
  };

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        switch (key) {
          case "customerId":
            invoiceQuery.customerId = value;
            break;
          case "search":
            invoiceQuery.id = { equals: Number(value) };
            break;
          default:
            break;
        }
      }
    }
  }

  const customer: SingleCustomer = await prisma.customer.findUnique({
    where: { id, companyId: "odetail" },
    include: {
      invoices: {
        include: {
          services: true,
        },
      },
      appointments: {
        include: {
          services: true,
          customer: true,
          invoice: {
            include: {
              services: true,
            },
          },
        },
      },
      _count: {
        select: { invoices: true, appointments: true },
      },
    },
  });

  if (!customer) {
    return notFound();
  }

  const [invoices, count] = await prisma.$transaction([
    prisma.invoice.findMany({
      where: invoiceQuery,
      include: {
        services: {
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
    prisma.invoice.count({ where: invoiceQuery }),
  ]);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-odetailBlack-dark py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-white">
                  {customer.firstName} {customer.lastName}
                </h1>
                <FormModal
                  table="customer"
                  type={{ label: "update", icon: faPencil }}
                  data={customer}
                  id={id}
                />
              </div>

              <p className="text-sm text-gray-400">{customer.notes}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-sm font-medium text-white">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-odetailBlue w-5"
                  />
                  <div className="">
                    <span>{customer.streetAddress1}</span>
                  </div>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-odetailBlue w-5"
                  />
                  <span>{customer.email}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-odetailBlue w-5"
                  />
                  <span>{formatPhoneNumber(customer.phone)}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className="text-odetailBlue w-5"
                  />
                  <span>
                    {moment.utc(customer.lastVisit).format("MMMM DD, YYYY")}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faPersonWalkingArrowLoopLeft}
                    className="text-odetailBlue w-5"
                  />
                  <span>{customer.returnCounter}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-odetailBlue w-5"
                  />
                  <span>
                    {customer.subscription ? "Has Warranty" : "No Warranty"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-odetailBlack-dark rounded-md p-4 h-[800px]">
          {/* CUSTOMER STATEMENTS */}
          <div className="flex items-center justify-between">
            <h1 className="hidden md:block text-xl font-semibold text-white">
              {customer.firstName}&apos;s Statements
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-4 self-end">
                <div className="flex items-center gap-4 self-end">
                  <DateRangeForm customerId={id} />
                </div>
                <Link href={`/list/customers/${id}/pdf`}>
                  <button className="px-3 py-2 bg-odetailBlue text-white rounded text-sm font-semibold">
                    Generate
                  </button>
                </Link>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-odetailBlue">
                  <FontAwesomeIcon icon={faSort} className="text-white w-5" />
                </button>

                <FormModal
                  table="statement"
                  type={{ label: "create", icon: faPlus }}
                  data={customer}
                />
              </div>
            </div>
          </div>
          {/* LIST */}
          <Table columns={columns} renderRow={renderRow} data={invoices} />
          {/* PAGINATION */}
          <Pagination page={p} count={count} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-odetailBlack-dark p-4 rounded-md text-white">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-white">
            <Link className="p-3 rounded-md bg-odetailBlue" href="/">
              Customer&apos;s Appointments
            </Link>
          </div>
        </div>
        <div className="mt-4 bg-odetailBlack-dark rounded-md p-4 h-[800px]">
          {/* APPOINTMENT DRAFTS */}
          <div className="flex items-center justify-between">
            <h1 className="hidden md:block text-xl font-semibold text-white">
              Appointment Drafts
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-4 self-end">
                <FormModal
                  table="appointment"
                  type={{ label: "create", icon: faPlus }}
                  data={customer}
                />
              </div>
            </div>
          </div>
          {/* LIST */}
          <Table
            columns={appointmentColumns}
            renderRow={renderAppointmentRow}
            data={customer.appointments}
          />
          {/* PAGINATION */}
          <Pagination page={p} count={customer._count.appointments} />
        </div>
      </div>
    </div>
  );
};

export default SingleCustomerPage;
