'use client';

import React from 'react';
import { DropdownListManager } from '@/components/dropdown-management/dropdown-list-manager';

export default function DropdownListsPage() {
  return (
    <div className="container mx-auto py-6">
      <DropdownListManager 
        title="إدارة القوائم المنسدلة"
        description="إدارة جميع خيارات القوائم المنسدلة المستخدمة في النظام"
        allowCreate={true}
        allowEdit={true}
        allowDelete={true}
        showInactive={true}
      />
    </div>
  );
}
