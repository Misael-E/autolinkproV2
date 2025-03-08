import {
  faClockRotateLeft,
  faEnvelope,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { Employee, prisma } from "@repo/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { notFound } from "next/navigation";
import FormModal from "@/components/FormModal";
import moment from "moment";

type SingleEmployee = Employee | null;

const SingleEmployeePage = async ({
  params,
}: {
  params: { [key: string]: string | undefined };
}) => {
  const { id } = params;
  const employee: SingleEmployee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return notFound();
  }
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full ">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-odetailBlack-dark py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-2/3 flex flex-col justify-between gap-4 ">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-white">
                  {employee.name}
                </h1>
                <FormModal
                  table="employee"
                  type={{ label: "update", icon: faPencil }}
                  data={employee}
                  id={id}
                />
              </div>
              <p className="text-sm text-gray-400">{employee.role}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium text-white">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-odetailBlue w-5"
                  />
                  <span>{employee.email}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className="text-odetailBlue w-5"
                  />
                  <span>
                    {moment.utc(employee.createdAt).format("MMMM DD, YYYY")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
          </div>
        </div>
      </div>
      {/* RIGHT */}
    </div>
  );
};

export default SingleEmployeePage;
