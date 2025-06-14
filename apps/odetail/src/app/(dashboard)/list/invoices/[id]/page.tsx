import FormModal from "@/components/FormModal";
import SendButton from "@/components/SendButton";
import { calculateInvoiceTotals } from "@/lib/util";
import {
  faArrowLeft,
  faEye,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Customer, Invoice, Service, prisma } from "@repo/database";
import moment from "moment";
import Link from "next/link";
import { notFound } from "next/navigation";

type SingleInvoice =
  | (Invoice & { customer: Customer } & { services: Service[] })
  | null;

const SingleInvoicePage = async ({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}) => {
  const invoiceId = parseInt(id);
  const { page } = searchParams;

  const p = page && parseInt(page);

  const invoice: SingleInvoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      services: true,
    },
  });

  if (!invoice) {
    return notFound();
  }

  const { subtotal, gst, total } = calculateInvoiceTotals(invoice.services);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full max-w-3xl">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-odetailBlack-dark py-6 px-6 md:px-8 rounded-md flex-1 flex gap-4 text-white">
            <div className="w-full flex flex-col justify-between gap-4">
              {p && (
                <Link href={`/list/invoices?page=${p}`}>
                  <button className="w-7 h-7 flex items-center justify-center rounded-full bg-odetailBlue">
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className="text-white w-5"
                    />
                  </button>
                </Link>
              )}
              <div className="flex flex-row justify-between">
                <h1 className="text-2xl font-semibold">
                  Invoice #{invoice.id.toString().padStart(6, "0")}
                </h1>
                <div className="flex flex-row space-x-2">
                  <FormModal
                    table="invoice"
                    type={{
                      label: "update",
                      icon: faPencil,
                    }}
                    data={invoice}
                    id={invoiceId}
                  />
                  <Link href={`/list/invoices/${invoiceId}/pdf`}>
                    <button className="w-7 h-7 flex items-center justify-center rounded-full bg-odetailGreen">
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-white w-5"
                      />
                    </button>
                  </Link>
                  <SendButton invoiceId={invoiceId} />
                </div>
              </div>

              {/* Invoice Date */}
              <div className="text-white">
                <h2 className="font-semibold text-lg">Invoice date</h2>
                <p className="text-sm text-gray-400">
                  {moment.utc(invoice.createdAt).format("MMMM DD, YYYY")}
                </p>
              </div>

              {/* Customer Info */}
              <div className="text-white">
                <h2 className="font-semibold text-lg">Customer</h2>
                <p className="text-sm text-gray-400">
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </p>
                <p className="text-sm text-gray-400">
                  {invoice.customer.email}
                </p>
                <p className="text-sm text-gray-400">
                  {invoice.customer.streetAddress1}
                </p>
                {invoice.customer.streetAddress2 && (
                  <p className="text-sm text-gray-400">
                    {invoice.customer.streetAddress2}
                  </p>
                )}
              </div>
              {/* Services */}
              <div className="mt-6 border-t-2 border-gray-700 pt-4">
                {invoice.services.map((service) => (
                  <div key={service.id} className="flex justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">
                        {service.serviceType}
                      </p>
                      {service.code && (
                        <p className="text-gray-500 text-xs italic">
                          {service.code} ({service.distributor})
                        </p>
                      )}
                    </div>
                    <p className="text-base font-semibold">
                      ${service.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {/* Subtotal, GST, Total */}
              <div className="border-t-2 border-gray-700 pt-4">
                <div className="flex justify-between pt-2">
                  <p className="text-white font-medium">Subtotal</p>
                  <p className="text-base font-semibold">${subtotal}</p>
                </div>
                <div className="flex justify-between pb-2">
                  <p className="text-white font-medium">GST (5%)</p>
                  <p className="text-base font-semibold">${gst}</p>
                </div>
              </div>
              {/* Total Amount */}
              <div className="border-t-2 border-gray-700 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <p className="text-white">Total</p>
                  <p className="text-odetailGreen">${total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      {/* <div className="w-full flex flex-col gap-4">
        <div className="bg-odetailBlack-dark p-4 rounded-md text-white">
          <h1 className="text-xl font-semibold">Invoice Preview</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500"></div>
        </div>
      </div> */}
    </div>
  );
};

export default SingleInvoicePage;
