import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import { Doctor } from "../models/doctor.model";
import ErrorHandler from "../utils/errorHandler";
import { format } from "date-fns";
import { Appointment, IAppointment } from "../models/appointment.model";
import { generate30MinsSlot } from "../utils/helpers";

export const doctorAvailableSlots = async (
  doctorId: string,
  date: Date,
  next: NextFunction
) => {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

  const { timeSlots, availableDays } = doctor;

  const selectedDay = format(date, "EEEE");

  //   check for appointments based on date
  const appointments: IAppointment[] | null = await Appointment.findAll({
    where: { doctorId, appointmentDate: date },
  });

  //   check for booked slots on same time slot
  const bookedSlots = appointments?.map((b) => b.bookingSlot);

  const fullSchedule: {
    [day: string]: {
      label: "Morning" | "Afternoon" | "Evening";
      availableSlots: string[];
    }[];
  } = {};

  //   loop for all the available days
  for (const day of availableDays) {
    const sessions = timeSlots[day] || [];
    const allSlots = sessions.map(
      (session: {
        label: "Morning" | "Afternoon" | "Evening";
        start: string;
        end: string;
      }) => {
        const rawSlots = generate30MinsSlot(session.start, session.end);

        return {
          label: session.label,
          availableSlots: rawSlots,
        };
      }
    );
    fullSchedule[day] = allSlots;
  }

  //   for selected day
  const selectedDaySessions = timeSlots[selectedDay] || [];
  const filteredSelectedSlots = selectedDaySessions.map(
    (session: {
      label: "Morning" | "Afternoon" | "Evening";
      start: string;
      end: string;
    }) => {
      const rawSlots = generate30MinsSlot(session.start, session.end);
      //  filter out the booked slots
      const availableSlots = rawSlots.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      return {
        label: session.label,
        availableSlots,
      };
    }
  );

  return {
    ...fullSchedule,
    selectedDay: {
      label: selectedDay,
      slots: filteredSelectedSlots,
    },
  };
};
