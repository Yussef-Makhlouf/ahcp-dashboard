import { toast } from "sonner";

// Enhanced toast utility with consistent messaging
export const toastUtils = {
  // Success messages
  success: {
    create: (entity: string) => toast.success(`Successfully created ${entity}`),
    update: (entity: string) => toast.success(`Successfully updated ${entity}`),
    delete: (entity: string) => toast.success(`Successfully deleted ${entity}`),
    save: (entity: string) => toast.success(`${entity} saved successfully`),
    action: (action: string) => toast.success(`Action completed: ${action}`),
  },

  // Error messages with user-friendly descriptions
  error: {
    // Network and connection errors
    network: () => toast.error("Connection failed. Please check your internet connection and try again."),
    server: () => toast.error("Server error occurred. Please try again later."),
    timeout: () => toast.error("Request timed out. Please try again."),
    
    // Validation errors
    validation: (field?: string) => 
      field 
        ? toast.error(`Please check the ${field} field and try again.`)
        : toast.error("Please check your input and try again."),
    
    // Authentication errors
    unauthorized: () => toast.error("Session expired. Please log in again."),
    forbidden: () => toast.error("You don't have permission to perform this action."),
    
    // Data errors
    notFound: (entity: string) => toast.error(`${entity} not found. It may have been deleted.`),
    duplicate: (field: string) => toast.error(`${field} already exists. Please use a different value.`),
    conflict: (message: string) => toast.error(`Conflict: ${message}`),
    
    // Generic errors
    generic: (action: string) => toast.error(`Failed to ${action}. Please try again.`),
    custom: (message: string) => toast.error(message),
  },

  // Warning messages
  warning: {
    unsavedChanges: () => toast.warning("You have unsaved changes. Are you sure you want to leave?"),
    dataLoss: () => toast.warning("This action may cause data loss. Please confirm."),
    custom: (message: string) => toast.warning(message),
  },

  // Info messages
  info: {
    loading: (action: string) => toast.info(`Loading ${action}...`),
    processing: (action: string) => toast.info(`Processing ${action}...`),
    custom: (message: string) => toast.info(message),
  },

  // API error handler - converts server errors to user-friendly messages
  handleApiError: (error: any, action: string = "perform this action") => {
    console.error('API Error:', error);

    // Network errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return toastUtils.error.network();
      }
      if (error.code === 'ECONNABORTED') {
        return toastUtils.error.timeout();
      }
      return toastUtils.error.server();
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message;

    // Handle specific status codes
    switch (status) {
      case 400:
        // Bad request - validation errors
        if (message?.includes('validation') || message?.includes('required')) {
          return toastUtils.error.validation();
        }
        if (message?.includes('duplicate') || message?.includes('exists')) {
          return toastUtils.error.duplicate('This value');
        }
        return toastUtils.error.custom(message || 'Invalid request. Please check your input.');
      
      case 401:
        return toastUtils.error.unauthorized();
      
      case 403:
        return toastUtils.error.forbidden();
      
      case 404:
        return toastUtils.error.notFound('Item');
      
      case 409:
        return toastUtils.error.conflict(message || 'Data conflict occurred');
      
      case 422:
        // Unprocessable entity - validation errors
        return toastUtils.error.validation();
      
      case 500:
        return toastUtils.error.server();
      
      default:
        return toastUtils.error.custom(message || `Failed to ${action}`);
    }
  },

  // Form validation error handler
  handleValidationError: (errors: Record<string, string>) => {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toastUtils.error.validation();
    }
  },

  // Loading states
  loading: {
    show: (message: string) => toast.loading(message),
    dismiss: (toastId: string | number) => toast.dismiss(toastId),
  }
};

// Entity-specific toast messages
export const entityToasts = {
  client: {
    create: () => toastUtils.success.create("client"),
    update: () => toastUtils.success.update("client"),
    delete: () => toastUtils.success.delete("client"),
    error: (action: string) => toastUtils.handleApiError({}, `manage client`),
  },
  
  vaccination: {
    create: () => toastUtils.success.create("vaccination record"),
    update: () => toastUtils.success.update("vaccination record"),
    delete: () => toastUtils.success.delete("vaccination record"),
    error: (action: string) => toastUtils.handleApiError({}, `manage vaccination record`),
  },
  
  mobileClinic: {
    create: () => toastUtils.success.create("mobile clinic visit"),
    update: () => toastUtils.success.update("mobile clinic visit"),
    delete: () => toastUtils.success.delete("mobile clinic visit"),
    error: (action: string) => toastUtils.handleApiError({}, `manage mobile clinic visit`),
  },
  
  parasiteControl: {
    create: () => toastUtils.success.create("parasite control record"),
    update: () => toastUtils.success.update("parasite control record"),
    delete: () => toastUtils.success.delete("parasite control record"),
    error: (action: string) => toastUtils.handleApiError({}, `manage parasite control record`),
  },
  
  equineHealth: {
    create: () => toastUtils.success.create("equine health record"),
    update: () => toastUtils.success.update("equine health record"),
    delete: () => toastUtils.success.delete("equine health record"),
    error: (action: string) => toastUtils.handleApiError({}, `manage equine health record`),
  },
  
  laboratory: {
    create: () => toastUtils.success.create("laboratory test"),
    update: () => toastUtils.success.update("laboratory test"),
    delete: () => toastUtils.success.delete("laboratory test"),
    error: (action: string) => toastUtils.handleApiError({}, `manage laboratory test`),
  },
  
  inventory: {
    create: () => toastUtils.success.create("inventory item"),
    update: () => toastUtils.success.update("inventory item"),
    delete: () => toastUtils.success.delete("inventory item"),
    error: (action: string) => toastUtils.handleApiError({}, `manage inventory item`),
  },
  
  schedule: {
    create: () => toastUtils.success.create("schedule"),
    update: () => toastUtils.success.update("schedule"),
    delete: () => toastUtils.success.delete("schedule"),
    error: (action: string) => toastUtils.handleApiError({}, `manage schedule`),
  },
};

export default toastUtils;
