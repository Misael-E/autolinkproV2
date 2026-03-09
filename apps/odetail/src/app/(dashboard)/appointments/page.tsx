import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormModal from "@/components/FormModal";
import { prisma } from "@repo/database";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AppointmentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const dataRes = await prisma.appointment.findMany({
    where: { companyId: "odetail" },
    include: {
      customer: true,
      services: true,
      invoice: true,
    },
  });

  const data = dataRes.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: appointment.startTime,
    end: appointment.endTime,
    description: appointment.description,
    resource: {
      customer: appointment.customer,
      services: appointment.services,
      invoice: appointment.invoice,
      status: appointment.status,
    },
  }));

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="hidden xl:block w-full min-w-0">
        <div className="bg-odetailBlack-dark px-4 pt-4 pb-8 rounded-md h-[700px]">
          <div className="flex flex-row justify-between mb-2">
            <h1 className="text-xl font-semibold text-white">Appointments</h1>
            <FormModal
              table="appointment"
              type={{ label: "create", icon: faPlus }}
            />
          </div>

          <BigCalendarContainer data={data} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-2/5 flex flex-col gap-8 min-w-0">
        <div className="bg-odetailBlack-dark px-4 pt-4 pb-8 rounded-md">
          <BigCalendarContainer data={data} defaultView={"agenda"} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
