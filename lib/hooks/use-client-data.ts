"use client";

import { useState, useCallback } from "react";
import type { Client } from "@/types";

interface ClientData {
  _id?: string;
  name: string;
  nationalId: string;
  phone: string;
  email?: string;
  village?: string;
  detailedAddress?: string;
  birthDate?: string;
  status?: string;
}

interface UseClientDataReturn {
  clientData: ClientData;
  setClientData: (data: ClientData) => void;
  updateClientData: (updates: Partial<ClientData>) => void;
  clearClientData: () => void;
  loadClientData: (client: Client) => void;
  isClientSelected: boolean;
  hasRequiredFields: boolean;
}

const initialClientData: ClientData = {
  name: "",
  nationalId: "",
  phone: "",
  email: "",
  village: "",
  detailedAddress: "",
  birthDate: "",
  status: "نشط",
};

export function useClientData(): UseClientDataReturn {
  const [clientData, setClientDataState] = useState<ClientData>(initialClientData);

  const setClientData = useCallback((data: ClientData) => {
    setClientDataState(data);
  }, []);

  const updateClientData = useCallback((updates: Partial<ClientData>) => {
    setClientDataState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearClientData = useCallback(() => {
    setClientDataState(initialClientData);
  }, []);

  const loadClientData = useCallback((client: Client) => {
    setClientDataState({
      _id: client._id,
      name: client.name || "",
      nationalId: client.nationalId || client.national_id || "",
      phone: client.phone || "",
      email: client.email || "",
      village: client.village || "",
      detailedAddress: client.detailedAddress || client.detailed_address || "",
      birthDate: client.birthDate || client.birth_date || "",
      status: client.status || "نشط",
    });
  }, []);

  const isClientSelected = Boolean(clientData._id);
  
  const hasRequiredFields = Boolean(
    clientData.name.trim() &&
    clientData.nationalId.trim() &&
    clientData.phone.trim()
  );

  return {
    clientData,
    setClientData,
    updateClientData,
    clearClientData,
    loadClientData,
    isClientSelected,
    hasRequiredFields,
  };
}
