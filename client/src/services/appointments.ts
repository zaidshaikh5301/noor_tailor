import { apiPost, USE_API } from './apiClient';

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

export async function createAppointment(
  payload: AppointmentPayload,
): Promise<AppointmentResult> {
  if (!USE_API) {
    return {
      id: `APT-${Date.now()}`,
      garmentType: payload.garmentType,
      occasion: payload.occasion,
      preferredDate: payload.preferredDate,
      contactMethod: payload.contactMethod,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
  }
  return apiPost<AppointmentResult>('/api/appointments', payload);
}
