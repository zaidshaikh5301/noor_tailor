import { apiPost } from './apiClient';

export type AppointmentPayload = {
  garmentType: string;
  occasion: string;
  preferredDate: string;
  contactMethod: 'in-store' | 'call';
  name: string;
  phone: string;
  email?: string;
  notes?: string;
};

export type AppointmentResult = {
  id: string;
  garmentType: string;
  occasion: string;
  preferredDate: string;
  contactMethod: string;
  status: string;
  createdAt: string;
};

export function createAppointment(
  payload: AppointmentPayload,
): Promise<AppointmentResult> {
  return apiPost<AppointmentResult>('/api/appointments', payload);
}
