import { prisma } from "@repo/database";
import { COMPANY_ID } from "@/lib/constants";

const ConversionRate = async ({
  startDate,
  endDate,
  locationId,
}: {
  startDate: string;
  endDate: string;
  locationId: string;
}) => {
  const dateFilter = { gte: new Date(startDate), lte: new Date(endDate) };

  const [totalAppointments, paidInvoicesLinked] = await Promise.all([
    prisma.appointment.count({
      where: { companyId: COMPANY_ID, locationId, createdAt: dateFilter },
    }),
    prisma.invoice.count({
      where: {
        companyId: COMPANY_ID,
        locationId,
        status: "Paid",
        createdAt: dateFilter,
        appointmentId: { not: null },
      },
    }),
  ]);

  const rate =
    totalAppointments > 0
      ? Math.round((paidInvoicesLinked / totalAppointments) * 100)
      : 0;

  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (circumference * rate) / 100;

  return (
    <div className="bg-aztecBlack-dark rounded-xl p-5 flex flex-col gap-3 flex-1">
      <div>
        <h2 className="text-sm font-bold text-white">Conversion Rate</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">Appointments → Paid</p>
      </div>

      <div className="flex items-center gap-4">
        <svg width="68" height="68" className="flex-shrink-0 -rotate-90">
          <circle cx="34" cy="34" r="28" fill="none" stroke="#212121" strokeWidth="7" />
          <circle
            cx="34"
            cy="34"
            r="28"
            fill="none"
            stroke={rate >= 60 ? "#39b972" : rate >= 30 ? "#FFA500" : "#ef4444"}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div>
          <p className={`text-2xl font-bold ${rate >= 60 ? "text-aztecGreen" : rate >= 30 ? "text-aztecOrange" : "text-red-400"}`}>
            {rate}%
          </p>
          <p className="text-[11px] text-gray-500">
            {paidInvoicesLinked} / {totalAppointments} appts
          </p>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-aztecBlack-light">
        <p className="text-[11px] text-gray-600">
          {rate >= 60 ? "Strong conversion" : rate >= 30 ? "Room to improve" : "Needs attention"}
        </p>
      </div>
    </div>
  );
};

export default ConversionRate;
