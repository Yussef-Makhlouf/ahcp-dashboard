"use client";

import React from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function AuthDebug() {
  const { user, token, isAuthenticated, error } = useAuthStore();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}
        </div>
        <div>
          <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : '❌ No Token'}
        </div>
        <div>
          <strong>User:</strong> {user?.name || '❌ No User'}
        </div>
        <div>
          <strong>Role:</strong> {user?.role || '❌ No Role'}
        </div>
        {error && (
          <div className="text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
