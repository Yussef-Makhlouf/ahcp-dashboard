'use client';

import React from 'react';
import { DropdownListManagerV2 } from '@/components/dropdown-management/dropdown-list-manager-v2';

export default function DropdownListsPage() {
  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <DropdownListManagerV2 
        allowEdit={true}
        allowDelete={true}
      />
    </div>
  );
}
