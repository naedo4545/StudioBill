export interface EstimateItem {
  id: string;
  category: 'planning' | 'production' | 'postProduction' | 'ai';
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  isDiscount?: boolean;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  category: 'budget' | 'tvc' | 'motion' | 'corporate' | 'sns' | 'youtube' | 'planning' | 'production' | 'postProduction' | 'ai';
  items: EstimateItem[];
  totalAmount: number;
}

export interface CompanyInfo {
  id: string;
  name: string;
  logo?: string; // base64 또는 url
  address: string;
  phone: string;
  email: string;
  website?: string;
  bizNo?: string;
  bizType?: string;
  bizItem?: string;
  bankName?: string;
  accountNumber?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
  signature?: string; // base64 또는 url
  stamp?: string; // base64 또는 url
}

export interface EstimateDocument {
  id: string;
  title: string;
  clientName: string;
  clientInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  companyInfo: CompanyInfo;
  items: EstimateItem[];
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  finalAmount: number;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  signature?: string;
  stamp?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  admins: string[];
  managers: string[];
} 