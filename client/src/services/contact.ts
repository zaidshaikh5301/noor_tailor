import { apiPost, USE_API } from './apiClient';

export type ContactMessagePayload = {
  name: string;
  email: string;
  message: string;
};

export type ContactMessageResult = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export async function sendContactMessage(
  payload: ContactMessagePayload,
): Promise<ContactMessageResult> {
  if (!USE_API) {
    return {
      id: `MSG-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };
  }
  return apiPost<ContactMessageResult>('/api/contact', payload);
}
