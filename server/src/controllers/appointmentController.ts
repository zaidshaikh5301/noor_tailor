import { Request, Response, NextFunction } from "express";
import { Appointment } from "../models/Appointment.js";
import { ApiError, catchAsync, sendError, sendSuccess } from "../utils/apiResponse.js";
import { appointmentSchema, zodErrorDetails } from "../utils/validation.js";

export const createAppointment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Please check your appointment details.", zodErrorDetails(parsed.error));
  }
  const data = parsed.data;
  const preferredDate = new Date(data.preferredDate);
  if (Number.isNaN(preferredDate.getTime())) {
    return sendError(res, 400, "Please enter a valid date.");
  }
  if (preferredDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    return sendError(res, 400, "Preferred date must be in the future.");
  }
  const appointment = await Appointment.create({
    garmentType: data.garmentType,
    occasion: data.occasion,
    preferredDate,
    contactMethod: data.contactMethod,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    notes: data.notes || undefined,
    status: "pending",
  });
  sendSuccess(
    res,
    {
      id: String(appointment._id),
      garmentType: appointment.garmentType,
      occasion: appointment.occasion,
      preferredDate: appointment.preferredDate,
      contactMethod: appointment.contactMethod,
      name: appointment.name,
      phone: appointment.phone,
      email: appointment.email,
      notes: appointment.notes,
      status: appointment.status,
      createdAt: appointment.createdAt,
    },
    201,
  );
});