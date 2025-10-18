#!/usr/bin/env node

/**
 * سكريبت لتحديث جميع ملفات الأعمدة لاستخدام مكونات التاريخ الجديدة
 */

const fs = require('fs');
const path = require('path');

const columnFiles = [
  'app/vaccination/components/columns.tsx',
  'app/parasite-control/components/columns.tsx', 
  'app/mobile-clinics/components/columns.tsx'
];

const dashboardPath = 'e:/termez_code/animal-care-system/ahcp-dashboard';

function updateColumnFile(filePath) {
  const fullPath = path.join(dashboardPath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add imports for date components
  if (!content.includes('SimpleDateCell')) {
    content = content.replace(
      /import { ([^}]+) } from "lucide-react";/,
      'import { $1 } from "lucide-react";\nimport { SimpleDateCell, BirthDateCell } from "@/components/ui/date-cell";'
    );
  }
  
  // Replace date formatting patterns
  const datePatterns = [
    // Pattern 1: new Date().toLocaleDateString("ar-EG")
    {
      search: /const date = new Date\(([^)]+)\);\s*return date\.toLocaleDateString\("ar-EG"\);/g,
      replace: 'return <SimpleDateCell date={$1} />;'
    },
    // Pattern 2: new Date().toLocaleDateString("ar-EG") in JSX
    {
      search: /{new Date\(([^)]+)\)\.toLocaleDateString\("ar-EG"\)}/g,
      replace: '{<SimpleDateCell date={$1} />}'
    },
    // Pattern 3: Birth date with Calendar icon
    {
      search: /const date = new Date\(birthDate\);\s*return \(\s*<div className="text-sm flex items-center gap-1">\s*<Calendar className="h-3 w-3" \/>\s*{date\.toLocaleDateString\("ar-EG"\)}\s*<\/div>\s*\);/g,
      replace: 'return <BirthDateCell date={birthDate} className="text-sm" />;'
    }
  ];
  
  let updated = false;
  datePatterns.forEach(pattern => {
    const newContent = content.replace(pattern.search, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️ No changes needed: ${filePath}`);
  }
}

console.log('🚀 Starting date columns update...\n');

columnFiles.forEach(updateColumnFile);

console.log('\n✅ Date columns update completed!');
