"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorAvailableSlots = void 0;
const doctor_model_1 = require("../models/doctor.model");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const date_fns_1 = require("date-fns");
const appointment_model_1 = require("../models/appointment.model");
const helpers_1 = require("../utils/helpers");
const doctorAvailableSlots = (doctorId, date, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctor = yield doctor_model_1.Doctor.findByPk(doctorId);
    if (!doctor)
        return next(new errorHandler_1.default("Doctor not found", 404));
    const { timeSlots, availableDays } = doctor;
    const selectedDay = (0, date_fns_1.format)(date, "EEEE");
    //   check for appointments based on date
    const appointments = yield appointment_model_1.Appointment.findAll({
        where: { doctorId, appointmentDate: date },
    });
    //   check for booked slots on same time slot
    const bookedSlots = appointments === null || appointments === void 0 ? void 0 : appointments.map((b) => b.bookingSlot);
    const fullSchedule = {};
    //   loop for all the available days
    for (const day of availableDays) {
        const sessions = timeSlots[day] || [];
        const allSlots = sessions.map((session) => {
            const rawSlots = (0, helpers_1.generate30MinsSlot)(session.start, session.end);
            return {
                label: session.label,
                availableSlots: rawSlots,
            };
        });
        fullSchedule[day] = allSlots;
    }
    //   for selected day
    const selectedDaySessions = timeSlots[selectedDay] || [];
    const filteredSelectedSlots = selectedDaySessions.map((session) => {
        const rawSlots = (0, helpers_1.generate30MinsSlot)(session.start, session.end);
        //  filter out the booked slots
        const availableSlots = rawSlots.filter((slot) => !bookedSlots.includes(slot));
        return {
            label: session.label,
            availableSlots,
        };
    });
    return Object.assign(Object.assign({}, fullSchedule), { selectedDay: {
            day: selectedDay,
            slots: filteredSelectedSlots,
        } });
});
exports.doctorAvailableSlots = doctorAvailableSlots;
