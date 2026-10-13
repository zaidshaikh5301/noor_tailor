import { apiPost } from './apiClient';

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

export function sendContactMessage(
  payload: ContactMessagePayload,
): Promise<ContactMessageResult> {
  return apiPost<ContactMessageResult>('/api/contact', payload);
}
