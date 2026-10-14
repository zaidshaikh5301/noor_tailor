import { shopConfig } from '../config/shop';

export function buildWhatsAppUrl(message: string): { url: string; isPlaceholder: boolean } {
  const number = shopConfig.whatsappNumber;
  if (!number || number === '91XXXXXXXXXX') {
    return { url: '#', isPlaceholder: true };
  }
  return { url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`, isPlaceholder: false };
}

export function openWhatsApp(message: string): void {
  const { url, isPlaceholder } = buildWhatsAppUrl(message);
  if (isPlaceholder) {
    alert('WhatsApp number not configured. Please contact the atelier directly.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildOrderWhatsAppMessage(params: {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount?: number;
  couponCode?: string;
}): string {
  const lines = [
    'Hello Noor Tailor, I would like to place an order request.',
    '',
    'CUSTOMER DETAILS:',
    `Name: ${params.name}`,
    `Phone: ${params.phone}`,
    `Address: ${params.address}, ${params.city}, ${params.state} - ${params.pincode}`,
    '',
    'ITEMS:',
  ];

  params.items.forEach((item, index) => {
    const priceStr = item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Price on request';
    lines.push(`${index + 1}. ${item.name} — ${item.size}, ${item.color} × ${item.quantity} — ${priceStr}`);
  });

  lines.push('');
  lines.push(`Subtotal: ${params.subtotal > 0 ? `₹${params.subtotal.toLocaleString('en-IN')}` : 'To be confirmed'}`);

  if (params.discount && params.discount > 0) {
    lines.push(`Coupon (${params.couponCode}): -₹${params.discount.toLocaleString('en-IN')}`);
  }

  const total = params.subtotal - (params.discount || 0);
  lines.push(`Total: ${total > 0 ? `₹${total.toLocaleString('en-IN')}` : 'To be confirmed'}`);

  if (params.notes) {
    lines.push('');
    lines.push(`Notes: ${params.notes}`);
  }

  lines.push('');
  lines.push('Please confirm availability, pricing, and delivery timeline.');

  return lines.join('\n');
}

export function buildProductEnquiryMessage(params: {
  productName: string;
  size: string;
  color: string;
  pageUrl: string;
}): string {
  return `Hello Noor Tailor, I am interested in "${params.productName}" (Size: ${params.size}, Colour: ${params.color}). Product page: ${params.pageUrl}. Could you please share availability and pricing?`;
}

export function buildAppointmentWhatsAppMessage(params: {
  garment: string;
  occasion: string;
  visit: string;
  date: string;
  name: string;
  phone: string;
  notes?: string;
}): string {
  const lines = [
    'Hello Noor Tailor, I would like to book a tailoring appointment.',
    '',
    'APPOINTMENT DETAILS:',
    `Garment: ${params.garment}`,
    `Occasion: ${params.occasion}`,
    `Preferred visit: ${params.visit === 'in-store' ? 'Visit the atelier' : 'Call me first'}`,
    `Preferred date: ${params.date}`,
    '',
    'CONTACT:',
    `Name: ${params.name}`,
    `Phone: ${params.phone}`,
  ];

  if (params.notes) {
    lines.push(`Notes: ${params.notes}`);
  }

  lines.push('');
  lines.push('Please confirm the appointment slot.');

  return lines.join('\n');
}

export function buildContactWhatsAppMessage(params: {
  name: string;
  message: string;
}): string {
  return `Hello Noor Tailor, this is ${params.name}. ${params.message}`;
}