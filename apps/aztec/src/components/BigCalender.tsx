"use client";

import {
  Calendar,
  EventProps,
  momentLocalizer,
  NavigateAction,
  stringOrDate,
  View,
  Views,
} from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { SyntheticEvent, useEffect, useState } from "react";
import { updateAppointment } from "@/lib/actions/appointment";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import FormModal from "./FormModal";
import { EventType } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { updateEvent } from "@/lib/features/calendar/calendarSlice";
import { convertDatesToISO, convertRawToDates } from "@/lib/util";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const BigCalendar = ({ defaultView = Views.MONTH }: { defaultView?: View }) => {
  const [view, setView] = useState<View>(Views.WEEK);
  const [availableViews, setAvailableViews] = useState<View[]>([
    "day",
    "agenda",
    "week",
    "month",
  ]);

  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const router = useRouter();
  const [updated, setUpdated] = useState({
    success: false,
    error: false,
  });

  const rawEvents = useAppSelector((state: RootState) => state.calendar.events);
  const dispatch = useAppDispatch();
  const events = convertRawToDates(rawEvents);

  // Checks and resizes calendar for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setView(Views.AGENDA);
        setAvailableViews([Views.AGENDA]);
      } else {
        setView(defaultView ? defaultView : Views.MONTH);
        setAvailableViews(
          defaultView === "agenda" ? ["agenda"] : ["day", "week", "month"]
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Re-renders page for calendar updates
  useEffect(() => {
    if (updated.success) {
      toast(`Appointment has been updated!`);
      router.refresh();
    }
  }, [router, updated.success]);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleOnEventDrop = async (
    droppedEvent: EventInteractionArgs<object>
  ) => {
    const { event, start, end } = droppedEvent;
    const appointment = event as EventType;
    const newStart = new Date(start as stringOrDate);
    const newEnd = new Date(end as stringOrDate);

    if (appointment.resource.customer) {
      const updatedEvent = {
        id: appointment.id,
        customerId: appointment.resource.customer.id,
        firstName: appointment.resource.customer.firstName,
        lastName: appointment.resource.customer.lastName,
        email: appointment.resource.customer.email,
        title: appointment.title,
        startTime: newStart,
        endTime: newEnd,
        phone: appointment.resource.customer.phone,
        streetAddress1: appointment.resource.customer.streetAddress1,
        description: appointment.description,
        services: appointment.resource.services,
      };

      try {
        const updatedState = await updateAppointment(
          updated,
          updatedEvent as any
        );
        setUpdated(updatedState);
        const convertedDatesToISO = convertDatesToISO(event);
        dispatch(updateEvent(convertedDatesToISO));
      } catch (error) {
        setUpdated({ success: false, error: true });
        console.error("Failed to update event:", error);
      }
    }
  };

  const handleOnSelect = async (
    event: object,
    e: SyntheticEvent<HTMLElement, Event>
  ) => {
    const appointment = event as EventType;
    setSelectedEvent(appointment);
    if (appointment.resource.invoice) {
      router.push(
        `/list/invoices/${appointment.resource.invoice[0].id}?aptid=${appointment.id}`
      );
    }
  };

  const handleOnNavigate = (
    newDate: Date,
    view: View,
    action: NavigateAction
  ) => {
    setCurrentDate(newDate);
  };

  return (
    <>
      <DnDCalendar
        localizer={localizer}
        events={events}
        date={currentDate}
        defaultView={view}
        defaultDate={moment().toDate()}
        views={availableViews}
        view={view}
        resizable={false}
        style={{ height: "98%" }}
        onView={handleOnChangeView}
        onEventDrop={handleOnEventDrop}
        onSelectEvent={handleOnSelect}
        onNavigate={handleOnNavigate}
        min={new Date(2025, 1, 0, 9, 0, 0)}
        max={new Date(2025, 1, 0, 18, 0, 0)}
        popup={true}
        components={{
          agenda: {
            event: ({ event }: EventProps<object>) => {
              const typedEvent = event as EventType;
              return (
                <div
                  className={`${defaultView === "agenda" ? "text-sm" : ""} flex justify-between items-center space-x-2 cursor-pointer`}
                >
                  <div className="space-y-1 text-wrap">
                    <h3
                      className={`text-aztecBlue font-bold ${defaultView === "agenda" ? "text-sm" : "text-lg"}`}
                    >
                      {typedEvent.title}
                    </h3>
                    {typedEvent.description && (
                      <p className="text-xs">{typedEvent.description}</p>
                    )}
                  </div>
                  <div className="text-xs">
                    <div
                      className="flex flex-row space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FormModal
                        table="appointment"
                        type={{ label: "update", icon: faPencil }}
                        data={typedEvent}
                        id={typedEvent.id}
                      />
                      <FormModal
                        table="appointment"
                        type={{ label: "delete", icon: faTrashCan }}
                        id={typedEvent.id}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          },
          month: {
            event: ({ event }: EventProps<object>) => {
              const typedEvent = event as EventType;
              return (
                <span className="cursor-pointer">
                  <h3 className="text-aztecBlack font-bold text-sm">
                    {typedEvent.title}
                  </h3>
                  {typedEvent.start && (
                    <p className="text-xs">
                      {moment(typedEvent.start).format("h:mm A")}
                    </p>
                  )}
                </span>
              );
            },
          },
        }}
      />
      {/* {openEventModal && selectedEvent && (
        <FormModal
          table="appointment"
          type={{ label: "update", icon: null }}
          data={selectedEvent}
          id={selectedEvent.id}
          openEventModal={openEventModal}
          setOpenEventModal={setOpenEventModal}
        />
      )} */}
    </>
  );
};

export default BigCalendar;
