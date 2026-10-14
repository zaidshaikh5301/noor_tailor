export const shopConfig = {
  name: 'Noor Tailor',
  tagline: 'A Tailoring House',
  whatsappNumber: '+91 9737722063', // TODO: replace with actual WhatsApp number in international format (digits only)
  phone: '+91 9737722063', // TODO: replace
  email: 'hello@noortailor.com', // TODO: replace
  addressLines: ['Masjid Fariya, Near Tower', 'Vansda, Gujarat'], // TODO: replace
  city: 'Vansda',
  state: 'Gujarat',
  pincode: '388620', // TODO: replace
  openingHours: 'Monday–Saturday, 11 am–8 pm · Sunday by appointment', // TODO: replace
  mapsUrl: 'https://maps.app.goo.gl/XXXXXXXX', // TODO: replace with actual Google Maps link
  instagramUrl: 'https://www.instagram.com/noortailor_vansda/',
  siteUrl: 'https://noortailor.netlify.app',
  currency: 'INR',
} as const;

export type ShopConfig = typeof shopConfig;

export function formatAddress(): string {
  return shopConfig.addressLines.join(', ');
}

export function formatPhone(): string {
  return shopConfig.phone.replace(/\s/g, '');
}

export function getWhatsAppUrl(message: string): string {
  const number = shopConfig.whatsappNumber;
  if (number === '+91 9737722063' || !number) {
    return '#';
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppLink(message: string, _label: string): { url: string; isPlaceholder: boolean } {
  const number = shopConfig.whatsappNumber;
  if (number === '+91 9737722063' || !number) {
    return { url: '#', isPlaceholder: true };
  }
  return { url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`, isPlaceholder: false };
}