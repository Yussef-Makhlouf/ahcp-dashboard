/**
 * دالة لتحليل وتنسيق التواريخ بصيغ مختلفة
 * تدعم: YYYY-MM-DD, YYYY-DD-MM, DD/MM/YYYY, MM/DD/YYYY
 */

export function parseFlexibleDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  
  // إذا كان التاريخ من نوع Date بالفعل
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  
  const dateStr = dateInput.toString().trim();
  if (!dateStr) return null;
  
  console.log(`🔍 Parsing flexible date: ${dateStr}`);
  
  // Handle YYYY-MM-DD or YYYY-DD-MM format with smart detection
  if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    const [year, part1, part2] = dateStr.split('-');
    const yearNum = parseInt(year);
    const num1 = parseInt(part1);
    const num2 = parseInt(part2);
    
    // Smart detection logic for birth dates
    let finalDate: Date | null = null;
    
    // If part1 > 12, it must be day (YYYY-DD-MM format)
    if (num1 > 12 && num2 <= 12) {
      finalDate = new Date(yearNum, num2 - 1, num1);
      console.log(`✅ Parsed as YYYY-DD-MM (part1>12): ${dateStr} -> ${finalDate}`);
    }
    // If part2 > 12, it must be day (YYYY-MM-DD format)
    else if (num2 > 12 && num1 <= 12) {
      finalDate = new Date(yearNum, num1 - 1, num2);
      console.log(`✅ Parsed as YYYY-MM-DD (part2>12): ${dateStr} -> ${finalDate}`);
    }
    // Both could be valid, prefer YYYY-MM-DD (ISO standard)
    else if (num1 <= 12 && num2 <= 31) {
      finalDate = new Date(yearNum, num1 - 1, num2);
      console.log(`✅ Parsed as YYYY-MM-DD (standard): ${dateStr} -> ${finalDate}`);
    }
    // Fallback to YYYY-DD-MM
    else if (num2 <= 12 && num1 <= 31) {
      finalDate = new Date(yearNum, num2 - 1, num1);
      console.log(`✅ Parsed as YYYY-DD-MM (fallback): ${dateStr} -> ${finalDate}`);
    }
    
    // Validate the final date
    if (finalDate && !isNaN(finalDate.getTime())) {
      // Additional validation for birth dates (reasonable range)
      const currentYear = new Date().getFullYear();
      const birthYear = finalDate.getFullYear();
      if (birthYear >= 1900 && birthYear <= currentYear) {
        return finalDate;
      }
    }
  }
  
  // Handle YYYY/MM/DD or YYYY/DD/MM format (like 1985/03/15)
  if (dateStr.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/)) {
    const [year, part1, part2] = dateStr.split('/');
    const yearNum = parseInt(year);
    const num1 = parseInt(part1);
    const num2 = parseInt(part2);
    
    // Smart detection logic
    let finalDate: Date | null = null;
    
    // If part1 > 12, it must be day (YYYY/DD/MM format)
    if (num1 > 12 && num2 <= 12) {
      finalDate = new Date(yearNum, num2 - 1, num1);
      console.log(`✅ Parsed as YYYY/DD/MM (part1>12): ${dateStr} -> ${finalDate}`);
    }
    // If part2 > 12, it must be day (YYYY/MM/DD format)
    else if (num2 > 12 && num1 <= 12) {
      finalDate = new Date(yearNum, num1 - 1, num2);
      console.log(`✅ Parsed as YYYY/MM/DD (part2>12): ${dateStr} -> ${finalDate}`);
    }
    // Both could be valid, prefer YYYY/MM/DD (standard ISO-like format)
    else if (num1 <= 12 && num2 <= 31) {
      finalDate = new Date(yearNum, num1 - 1, num2);
      console.log(`✅ Parsed as YYYY/MM/DD (standard): ${dateStr} -> ${finalDate}`);
    }
    // Fallback to YYYY/DD/MM
    else if (num2 <= 12 && num1 <= 31) {
      finalDate = new Date(yearNum, num2 - 1, num1);
      console.log(`✅ Parsed as YYYY/DD/MM (fallback): ${dateStr} -> ${finalDate}`);
    }
    
    if (finalDate && !isNaN(finalDate.getTime())) {
      const currentYear = new Date().getFullYear();
      const birthYear = finalDate.getFullYear();
      if (birthYear >= 1900 && birthYear <= currentYear) {
        return finalDate;
      }
    }
  }
  
  // Handle DD/MM/YYYY format
  if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      console.log(`✅ Parsed as DD/MM/YYYY: ${dateStr} -> ${date}`);
      return date;
    }
  }
  
  // Handle MM/DD/YYYY format
  if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      console.log(`✅ Parsed as MM/DD/YYYY: ${dateStr} -> ${date}`);
      return date;
    }
  }
  
  // Handle DD-MM-YYYY format
  if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      console.log(`✅ Parsed as DD-MM-YYYY: ${dateStr} -> ${date}`);
      return date;
    }
  }
  
  // Try standard Date parsing as fallback
  const standardDate = new Date(dateStr);
  if (!isNaN(standardDate.getTime())) {
    console.log(`✅ Parsed with standard Date(): ${dateStr} -> ${standardDate}`);
    return standardDate;
  }
  
  console.warn(`⚠️ Could not parse date: ${dateStr}`);
  return null;
}

/**
 * تنسيق التاريخ للعرض بالعربية
 */
export function formatDateForDisplay(dateInput: string | Date | null | undefined): string {
  const date = parseFlexibleDate(dateInput);
  
  if (!date) {
    return 'غير محدد';
  }
  
  try {
    return date.toLocaleDateString("ar-EG", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    // Fallback to simple format if Arabic locale fails
    return date.toLocaleDateString("en-US");
  }
}

/**
 * تنسيق التاريخ للعرض المختصر
 */
export function formatDateShort(dateInput: string | Date | null | undefined): string {
  const date = parseFlexibleDate(dateInput);
  
  if (!date) {
    return 'غير محدد';
  }
  
  try {
    return date.toLocaleDateString("ar-EG");
  } catch (error) {
    // Fallback format
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

/**
 * تحويل التاريخ إلى صيغة ISO للحفظ
 */
export function formatDateForSave(dateInput: string | Date | null | undefined): string | null {
  const date = parseFlexibleDate(dateInput);
  
  if (!date) {
    return null;
  }
  
  // Return in YYYY-MM-DD format
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * التحقق من صحة التاريخ
 */
export function isValidDate(dateInput: string | Date | null | undefined): boolean {
  return parseFlexibleDate(dateInput) !== null;
}
