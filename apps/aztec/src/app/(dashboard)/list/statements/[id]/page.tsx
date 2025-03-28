import FormModal from "@/components/FormModal";
import { calculateCreditAgingBuckets, formatPhoneNumber } from "@/lib/util";
import { faEye, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Revenue, Statement, prisma } from "@repo/database";
import moment from "moment";
import Link from "next/link";
import { notFound } from "next/navigation";

type SingleStatement = (Statement & { revenues: Revenue[] }) | null;

const SingleStatementPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const statementId = parseInt(id);

  const statements: SingleStatement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      revenues: true,
    },
  });

  if (!statements) {
    return notFound();
  }

  const [items, totals] = await prisma.$transaction([
    prisma.revenue.findMany({
      where: {
        service: {
          distributor: statements.distributor,
          createdAt: {
            gte: new Date(statements.startDate),
            lte: new Date(statements.endDate),
          },
        },
        companyId: "aztec",
      },
      include: {
        service: {
          include: {
            invoice: true,
          },
        },
      },
    }),
    prisma.revenue.groupBy({
      by: ["invoiceId"],
      where: {
        service: {
          distributor: statements.distributor,
          createdAt: {
            gte: new Date(statements.startDate),
            lte: new Date(statements.endDate),
          },
        },
        companyId: "aztec",
      },
      _sum: {
        grossSalesGst: true,
        costBeforeGst: true,
        costAfterGst: true,
      },
      orderBy: {
        invoiceId: "asc",
      },
    }),
  ]);

  const totalCurrentAmount = totals.reduce(
    (sum, e) => sum + (e._sum?.costBeforeGst ?? 0),
    0
  );
  const amountPaid = statements.amountPaid ?? 0;
  const baseCurrentAmount = totalCurrentAmount - amountPaid;
  console.log(`Base Amount: ${baseCurrentAmount}`);

  const {
    current: currentAmount,
    thirty: thirtyDayAmount,
    sixty: sixtyDayAmount,
    sixtyPlus: sixtyPlusAmount,
    amountDue,
  } = calculateCreditAgingBuckets(statements.revenues, amountPaid);

  const handlePaymentSuccess = (updatedStatement: any) => {
    // For now, you might choose to re-fetch the page data or update a client state.
    console.log("Payment updated", updatedStatement);
  };

  return (
    <div className="m-6 w-3/2 bg-aztecBlack-dark shadow-lg p-6 text-white rounded-lg">
      {/* HEADER */}
      <div className="flex justify-between border-b pb-4">
        {/* Left Side - Company Info */}
        <div>
          <div className="flex flex-row space-x-2">
            <h1 className="text-xl font-bold mb-2">Aztec</h1>
            <FormModal
              table="statement"
              type={{
                label: "update",
                icon: faPencil,
              }}
              data={statements}
              id={statementId}
            />
          </div>

          <p className="text-sm text-gray-400">
            203 - 2914 Kingsview Boulevard SE
          </p>
          <p className="text-sm text-gray-400">Airdrie, Alberta T4A 0E1</p>
          <p className="text-sm text-gray-400">
            {formatPhoneNumber("5873662254")}
          </p>
        </div>

        {/* Right Side - Statement Info */}
        <div className="text-left flex flex-col gap-2">
          <h2 className="text-lg font-bold">Customer Statement</h2>
          <p className="text-sm text-white font-normal">
            <span className="font-semibold ">Statement Date:</span>
            {"\t"}
            {moment.utc(statements.endDate).format("MMM/DD/YYYY")}
          </p>
          <div className="">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-white">Date From: </span>
              {"\t"}
              {moment.utc(statements.startDate).format("MMMM D, YYYY")}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-white">Date To: </span>
              {"\t"}
              {moment.utc(statements.endDate).format("MMMM D, YYYY")}
            </p>
          </div>
        </div>
      </div>

      {/* INVOICE TABLE */}
      <div className="mt-6">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-400 text-center text-sm text-black">
              <th className="border">INVOICE NO.</th>
              <th className="border">DATE</th>
              <th className="border">DESCRIPTION</th>
              <th className="border p-2">CHARGES</th>
              <th className="border p-2">BALANCE</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-sm text-center">
                <td className="">
                  {item.service?.invoiceId?.toString().padStart(6, "0")}
                </td>
                <td className="">
                  {moment.utc(item.createdAt).format("MM/DD/YYYY")}
                </td>
                <td className="">{item.service?.code}</td>
                <td className="">${item.costBeforeGst?.toFixed(2)}</td>
                <td className="">${item.costBeforeGst?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full border-collapse mt-6">
          <tbody>
            {/* TOTALS ROW */}
            <tr className="text-sm font-bold bg-gray-600 text-white text-center">
              <th className="border">CURRENT</th>
              <th className="border">30 DAYS</th>
              <th className="border">60 DAYS</th>
              <th className="border">60+ DAYS</th>
              <th className="border">AMOUNT DUE</th>
            </tr>
            <tr className="text-sm text-center">
              <td className="p-2">${currentAmount.toFixed(2)}</td>
              <td className="p-2">${thirtyDayAmount.toFixed(2)}</td>
              <td className="p-2">${sixtyDayAmount.toFixed(2)}</td>
              <td className="p-2">${sixtyPlusAmount.toFixed(2)}</td>
              <td className="p-2">${amountDue.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SingleStatementPage;
