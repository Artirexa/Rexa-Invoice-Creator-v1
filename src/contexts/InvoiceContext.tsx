import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DatabaseService from '@/lib/database';
import { useAuth } from '@/App';
import { toast } from 'sonner';

export type CompanyInfo = {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  logoUrl: string | null;
};

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percent 0-100
  tax: number; // percent 0-100
  total: number;
};

export type InvoiceDetails = {
  invoiceNumber: string;
  paymentTerms: string;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd or ''
  dueDateEnabled?: boolean;
  notes: string;
};

export type InvoiceData = {
  id: string;
  company: CompanyInfo;
  customer: CustomerInfo;
  details: InvoiceDetails;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

type InvoiceContextType = {
  currentInvoice: InvoiceData;
  savedInvoices: InvoiceData[];
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  updateInvoiceDetails: (details: Partial<InvoiceDetails>) => void;
  addItem: () => void;
  updateItem: (id: string, item: Partial<InvoiceItem>) => void;
  removeItem: (id: string) => void;
  calculateTotals: () => void;
  saveInvoice: () => Promise<void>;
  loadInvoice: (id: string) => void;
  createNewInvoice: () => void;
  deleteInvoice: (id: string) => Promise<void>;
  setCompanyLogo: (url: string | null) => void;
  isLoading: boolean;
  isSaving: boolean;
  loadInvoices: () => Promise<void>;
  canCreateInvoice: boolean;
};

const initialCompany: CompanyInfo = {
  name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  zipCode: '',
  country: '',
  logoUrl: null,
};

const initialCustomer: CustomerInfo = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zipCode: '',
  country: '',
};

const initialDetails: InvoiceDetails = {
  invoiceNumber: 'INV-001',
  paymentTerms: 'Net 30',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  dueDateEnabled: false,
  notes: '',
};

function calculateTotalsForItems(items: InvoiceItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice) * (item.discount || 0) / 100, 0);
  const taxableBase = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.quantity * item.unitPrice) * (item.discount || 0) / 100), 0);
  const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.quantity * item.unitPrice) * (item.discount || 0) / 100) * (item.tax || 0) / 100, 0);
  const total = taxableBase + taxTotal;
  return { subtotal, discountTotal, taxTotal, total };
}

function createEmptyItem(): InvoiceItem {
  return {
    id: uuidv4(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    tax: 0,
    total: 0,
  };
}

function buildInvoice(): InvoiceData {
  const items: InvoiceItem[] = [];
  const totals = calculateTotalsForItems(items);
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    company: { ...initialCompany },
    customer: { ...initialCustomer },
    details: { ...initialDetails },
    items,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxTotal: totals.taxTotal,
    total: totals.total,
    createdAt: now,
    updatedAt: now,
  };
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData>(buildInvoice());
  const [canCreateInvoice, setCanCreateInvoice] = useState(true);

  // Load invoices when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInvoices();
      checkInvoiceLimit();
    }
  }, [isAuthenticated, user]);

  // Load invoices from database
  const loadInvoices = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const invoices = await DatabaseService.getInvoices(user.id);
      setSavedInvoices(invoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can create more invoices
  const checkInvoiceLimit = async () => {
    if (!user) return;
    
    try {
      const canCreate = await DatabaseService.canCreateInvoice(user.id);
      setCanCreateInvoice(canCreate);
    } catch (error) {
      console.error('Error checking invoice limit:', error);
      setCanCreateInvoice(false);
    }
  };

  // Load user profile and populate company info
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
    }
  }, [isAuthenticated, user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await DatabaseService.getProfile(user.id);
      if (profile) {
        // Update current invoice with saved company info
        setCurrentInvoice(prev => ({
          ...prev,
          company: {
            name: profile.company_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            website: profile.website || '',
            address: profile.address || '',
            city: '',
            zipCode: '',
            country: '',
            logoUrl: profile.company_logo || null,
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateTotals = () => {
    const itemsWithTotals = currentInvoice.items.map((item) => {
      const base = item.quantity * item.unitPrice;
      const discounted = base - base * (item.discount || 0) / 100;
      const withTax = discounted + discounted * (item.tax || 0) / 100;
      return { ...item, total: parseFloat(withTax.toFixed(2)) };
    });
    const totals = calculateTotalsForItems(itemsWithTotals);
    setCurrentInvoice((prev) => ({
      ...prev,
      items: itemsWithTotals,
      subtotal: parseFloat(totals.subtotal.toFixed(2)),
      discountTotal: parseFloat(totals.discountTotal.toFixed(2)),
      taxTotal: parseFloat(totals.taxTotal.toFixed(2)),
      total: parseFloat(totals.total.toFixed(2)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateCompanyInfo = async (info: Partial<CompanyInfo>) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      company: { ...prev.company, ...info },
      updatedAt: new Date().toISOString(),
    }));

    // Save company info to user profile
    if (user && isAuthenticated) {
      try {
        await DatabaseService.updateCompanyInfo(user.id, info);
      } catch (error) {
        console.error('Error updating company info:', error);
        toast.error('Failed to save company information');
      }
    }
  };

  const setCompanyLogo = (url: string | null) => {
    updateCompanyInfo({ logoUrl: url });
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      customer: { ...prev.customer, ...info },
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateInvoiceDetails = (details: Partial<InvoiceDetails>) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      details: { ...prev.details, ...details },
      updatedAt: new Date().toISOString(),
    }));
  };

  const addItem = () => {
    setCurrentInvoice((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateItem = (id: string, item: Partial<InvoiceItem>) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...item } : it)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeItem = (id: string) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  const saveInvoice = async () => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to save invoices');
      return;
    }

    try {
      setIsSaving(true);
      
      // Check if user can create more invoices
      const canCreate = await DatabaseService.canCreateInvoice(user.id);
      if (!canCreate) {
        toast.error('You have reached your monthly invoice limit. Upgrade to premium for unlimited invoices.');
        return;
      }

      // Save to database
      await DatabaseService.saveInvoice(currentInvoice, user.id);
      
      // Update local state
      setSavedInvoices((prev) => {
        const exists = prev.some((inv) => inv.id === currentInvoice.id);
        const updated = { ...currentInvoice, updatedAt: new Date().toISOString() };
        if (exists) {
          return prev.map((inv) => (inv.id === updated.id ? updated : inv));
        }
        return [...prev, updated];
      });

      toast.success('Invoice saved successfully');
      
      // Refresh invoice limit check
      await checkInvoiceLimit();
      
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const loadInvoice = (id: string) => {
    const found = savedInvoices.find((inv) => inv.id === id);
    if (found) {
      setCurrentInvoice(found);
    }
  };

  const createNewInvoice = () => {
    setCurrentInvoice(buildInvoice());
  };

  const deleteInvoice = async (id: string) => {
    if (!user || !isAuthenticated) {
      toast.error('Please login to delete invoices');
      return;
    }

    try {
      await DatabaseService.deleteInvoice(id, user.id);
      setSavedInvoices((prev) => prev.filter((inv) => inv.id !== id));
      
      if (currentInvoice.id === id) {
        setCurrentInvoice(buildInvoice());
      }
      
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const value = useMemo<InvoiceContextType>(() => ({
    currentInvoice,
    savedInvoices,
    updateCompanyInfo,
    updateCustomerInfo,
    updateInvoiceDetails,
    addItem,
    updateItem,
    removeItem,
    calculateTotals,
    saveInvoice,
    loadInvoice,
    createNewInvoice,
    deleteInvoice,
    setCompanyLogo,
    isLoading,
    isSaving,
    loadInvoices,
    canCreateInvoice,
  }), [currentInvoice, savedInvoices, isLoading, isSaving, canCreateInvoice, user, isAuthenticated]);

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = (): InvoiceContextType => {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
};

export type { InvoiceContextType };
