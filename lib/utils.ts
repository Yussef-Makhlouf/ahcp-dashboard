import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Egyptian phone number
  if (cleaned.startsWith('20')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function validateEgyptianPhone(phone: string): boolean {
  const regex = /^(?:\+20|0)?1[0125]\d{8}$/;
  return regex.test(phone.replace(/\D/g, ''));
}

export function validateSaudiPhone(phone: string): boolean {
  // Saudi phone number validation
  // Format: +966XXXXXXXXX or 05XXXXXXXX or 5XXXXXXXX
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with 966 (country code)
  if (cleaned.startsWith('966')) {
    return cleaned.length === 12 && /^9665[0-9]{8}$/.test(cleaned);
  }
  
  // Check if it starts with 05 (local format)
  if (cleaned.startsWith('05')) {
    return cleaned.length === 10 && /^05[0-9]{8}$/.test(cleaned);
  }
  
  // Check if it starts with 5 (without leading zero)
  if (cleaned.startsWith('5')) {
    return cleaned.length === 9 && /^5[0-9]{8}$/.test(cleaned);
  }
  
  return false;
}
