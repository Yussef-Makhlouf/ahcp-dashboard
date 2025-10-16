import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'غير محدد';
  }
  
  const d = new Date(date);
  
  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return 'تاريخ غير صالح';
  }
  
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error, 'Original date:', date);
    return 'تاريخ غير صالح';
  }
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) {
    return 'غير محدد';
  }
  
  try {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Egyptian phone number
    if (cleaned.startsWith('20')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.startsWith('01')) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone;
  } catch (error) {
    console.error('Error formatting phone number:', error, 'Original phone:', phone);
    return phone || 'غير محدد';
  }
}

export function validateEgyptianPhone(phone: string): boolean {
  const regex = /^(?:\+20|0)?1[0125]\d{8}$/;
  return regex.test(phone.replace(/\D/g, ''));
}

export function validateSaudiPhone(phone: string): boolean {
  // Saudi phone number validation
  // Format: +966XXXXXXXXX or 05XXXXXXXX or 5XXXXXXXX
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with 966 (country code  )
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

// Enhanced phone validation for international numbers
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a valid phone number (10-15 digits)
  const phoneRegex = /^[\+]?[0-9]{10,15}$/;
  return phoneRegex.test(cleanPhone);
}

// Enhanced national ID validation
export function validateNationalId(nationalId: string): boolean {
  // Remove all non-digit characters
  const cleanId = nationalId.replace(/\D/g, '');
  
  // Check if it's between 10-14 digits
  return /^\d{10,14}$/.test(cleanId);
}
