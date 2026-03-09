"use client";

import { EventType } from "@/lib/types";
import BigCalendar from "./BigCalender";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect } from "react";
import { setEvents } from "@/lib/features/calendar/calendarSlice";
import { convertDatesToISO } from "@/lib/util";
import { View, Views } from "react-big-calendar";

const BigCalendarContainer = ({
  data,
  defaultView = Views.MONTH,
}: {
  data: EventType[];
  defaultView?: View;
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data.length > 0) {
      const confirmedEvents = data.filter(
        (event) => event.resource?.status !== "Draft"
      );
      const formattedData = convertDatesToISO(confirmedEvents);
      dispatch(setEvents(formattedData));
    }
  }, [dispatch, data]);

  const isAgendaOnly = defaultView === "agenda";

  return (
    <div className={isAgendaOnly ? "min-w-0" : "h-[calc(100%-2.5rem)] min-w-0 overflow-x-auto"}>
      <BigCalendar defaultView={defaultView} />
    </div>
  );
};

export default BigCalendarContainer;
