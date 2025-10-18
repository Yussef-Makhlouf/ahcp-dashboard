/**
 * اختبار دوال التاريخ للتأكد من عملها الصحيح
 */

import { parseFlexibleDate, formatDateShort } from './date-utils';

export function testDateParsing() {
  const testCases = [
    // Test cases from the image
    '1985/03/15',  // Should parse as March 15, 1985
    '1990/12/25',  // Should parse as December 25, 1990
    '2000/01/01',  // Should parse as January 1, 2000
    
    // Other formats
    '1985-03-15',  // ISO format
    '1985-15-03',  // YYYY-DD-MM format
    '15/03/1985',  // DD/MM/YYYY format
    '03/15/1985',  // MM/DD/YYYY format
    
    // Edge cases
    '1985/31/12',  // YYYY/DD/MM format (December 31)
    '1985/13/01',  // Invalid month, should try YYYY/DD/MM
  ];
  
  console.log('🧪 Testing date parsing functions...\n');
  
  testCases.forEach(testDate => {
    console.log(`Testing: "${testDate}"`);
    const parsed = parseFlexibleDate(testDate);
    const formatted = formatDateShort(testDate);
    
    if (parsed) {
      console.log(`  ✅ Parsed: ${parsed.toISOString().split('T')[0]}`);
      console.log(`  📅 Formatted: ${formatted}`);
    } else {
      console.log(`  ❌ Failed to parse`);
    }
    console.log('');
  });
}

// Test specific case from the image
export function testBirthDateCase() {
  const birthDate = '1985/03/15';
  console.log(`🎯 Testing specific birth date: ${birthDate}`);
  
  const parsed = parseFlexibleDate(birthDate);
  const formatted = formatDateShort(birthDate);
  
  console.log(`Parsed result:`, parsed);
  console.log(`Formatted result:`, formatted);
  
  if (parsed) {
    const year = parsed.getFullYear();
    const month = parsed.getMonth() + 1; // 0-indexed
    const day = parsed.getDate();
    console.log(`Expected: Year=1985, Month=3, Day=15`);
    console.log(`Actual: Year=${year}, Month=${month}, Day=${day}`);
    
    const isCorrect = year === 1985 && month === 3 && day === 15;
    console.log(`✅ Test ${isCorrect ? 'PASSED' : 'FAILED'}`);
    
    return isCorrect;
  } else {
    console.log(`❌ Test FAILED - Could not parse date`);
    return false;
  }
}
