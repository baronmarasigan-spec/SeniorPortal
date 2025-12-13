

export enum Role {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  LCR_PWD_ADMIN = 'LCR_PWD_ADMIN',
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ISSUED = 'Issued',
}

export enum ApplicationType {
  REGISTRATION = 'Registration',
  ID_NEW = 'New ID',
  ID_RENEWAL = 'ID Renewal',
  ID_REPLACEMENT = 'ID Replacement',
  BENEFIT_CASH = 'Cash Gift',
  BENEFIT_MED = 'Medical Assistance',
  PHILHEALTH = 'PhilHealth',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatarUrl?: string;
  birthDate?: string; // ISO string
  address?: string;
  seniorIdNumber?: string; // Only for approved citizens
  seniorIdIssueDate?: string; // ISO string
  seniorIdExpiryDate?: string; // ISO string
  contactNumber?: string;
  emergencyContact?: string;
  username?: string; // For demo/testing display
  password?: string; // For demo/testing display
  
  // Extended Profile Fields
  sex?: string;
  civilStatus?: string;
  birthPlace?: string;
  livingArrangement?: string;
  isPensioner?: boolean;
  pensionAmount?: string;
  pensionSource?: string;
  hasIllness?: boolean;
  illnessDetails?: string;
  bloodType?: string;
}

export interface Application {
  id: string;
  userId: string;
  userName: string;
  type: ApplicationType;
  date: string;
  status: ApplicationStatus;
  description: string;
  documents?: string[]; // Array of simulated document names
  rejectionReason?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  date: string;
  subject: string;
  details: string;
  status: 'Open' | 'Resolved';
  aiSummary?: string; // For AI feature
}

export interface StatMetric {
  label: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface RegistryRecord {
  id: string; // The LCR or PWD ID number
  type: 'LCR' | 'PWD';
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  citizenship?: string;
  birthDate: string;
  birthPlace?: string; // New field for auto-fetch
  sex?: string;
  civilStatus?: string;
  // Address Breakdown
  province?: string;
  city?: string;
  district?: string;
  barangay?: string;
  street?: string;
  houseNo?: string;
  address?: string; // Full string for fallback display
  isRegistered: boolean; // true if they already have a Senior Connect account
}