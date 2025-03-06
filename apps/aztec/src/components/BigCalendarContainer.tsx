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
      const formattedData = convertDatesToISO(data);
      dispatch(setEvents(formattedData));
    }
  }, [dispatch, data]);

  return (
    <div className="h-full">
      <BigCalendar defaultView={defaultView} />
    </div>
  );
};

export default BigCalendarContainer;
