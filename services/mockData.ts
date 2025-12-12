

import { Application, ApplicationStatus, ApplicationType, Complaint, RegistryRecord, Role, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u_dummy',
    name: 'Juan Dela Cruz',
    role: Role.CITIZEN,
    email: 'juan@email.com',
    birthDate: '1955-03-15',
    address: '155 F. Blumentritt, San Juan',
    seniorIdNumber: 'SC-2024-DUMMY',
    seniorIdIssueDate: '2024-01-15',
    seniorIdExpiryDate: '2027-01-15', // 3 years validity
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    contactNumber: '0917 000 0000',
    emergencyContact: 'Maria Dela Cruz - 0917 111 1111',
    username: 'juan',
    password: 'password123'
  },
  {
    id: 'u_no_id',
    name: 'Pedro Penduko',
    role: Role.CITIZEN,
    email: 'pedro@email.com',
    birthDate: '1960-01-01',
    address: 'Sample Address, San Juan City',
    seniorIdNumber: undefined, // No ID Issued
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    contactNumber: '0918 222 2222',
    emergencyContact: 'Pedro Jr. - 0918 333 3333',
    username: 'pedro',
    password: 'password123'
  },
  {
    id: 'u_new_applicant',
    name: 'Maria Clara',
    role: Role.CITIZEN,
    email: 'maria@example.com',
    birthDate: '1963-05-01',
    address: 'Brgy. Corazon de Jesus, San Juan',
    seniorIdNumber: undefined, // Not yet issued
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    contactNumber: '0919 123 4567',
  },
  {
    id: 'u_renew_applicant',
    name: 'Crisostomo Ibarra',
    role: Role.CITIZEN,
    email: 'ibarra@example.com',
    birthDate: '1950-12-30',
    address: 'Brgy. Greenhills, San Juan',
    seniorIdNumber: 'SC-2018-009', // Expiring ID
    seniorIdIssueDate: '2018-11-01',
    seniorIdExpiryDate: '2021-11-01', // Expired
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Crisostomo',
    contactNumber: '0920 987 6543',
  },
  {
    id: 'u_replace_applicant',
    name: 'Elias Salome',
    role: Role.CITIZEN,
    email: 'elias@example.com',
    birthDate: '1958-06-19',
    address: 'Brgy. West Crame, San Juan',
    seniorIdNumber: 'SC-2020-555', // Lost ID
    seniorIdIssueDate: '2020-05-15',
    seniorIdExpiryDate: '2023-05-15',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elias',
    contactNumber: '0921 555 5555',
  },
  {
    id: 'u1',
    name: 'Martha Stewart',
    role: Role.CITIZEN,
    email: 'martha@example.com',
    birthDate: '1954-05-12',
    address: '123 Maple Street, City Center',
    seniorIdNumber: 'SC-2023-001',
    seniorIdIssueDate: '2023-01-01',
    seniorIdExpiryDate: '2026-01-01',
    avatarUrl: 'https://picsum.photos/200/200',
    contactNumber: '0917 123 4567',
    emergencyContact: 'Alexis Stewart - 0918 999 8888',
    username: 'martha',
    password: 'password123'
  },
  {
    id: 'u2',
    name: 'Arthur Doyle',
    role: Role.CITIZEN,
    email: 'arthur@example.com',
    birthDate: '1949-11-22',
    address: '456 Oak Avenue, Suburbia',
    avatarUrl: 'https://picsum.photos/201/201',
    contactNumber: '0922 555 1234',
    emergencyContact: 'Jean Leckie - 0917 111 2222',
    username: 'arthur',
    password: 'password123'
  },
  {
    id: 'a1',
    name: 'Admin Officer',
    role: Role.ADMIN,
    email: 'admin@gov.ph',
    avatarUrl: 'https://picsum.photos/202/202',
    username: 'admin',
    password: 'password123'
  },
  {
    id: 'agency1',
    name: 'LCR/PWD Officer',
    role: Role.LCR_PWD_ADMIN,
    email: 'agency@gov.ph',
    avatarUrl: 'https://picsum.photos/203/203',
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  // --- Dummy Data for Registration Testing ---
  {
    id: 'app_reg_test_1',
    userId: 'temp_user_1', 
    userName: 'Rolando "Lolo" Pascual',
    type: ApplicationType.REGISTRATION,
    date: '2023-10-28',
    status: ApplicationStatus.PENDING,
    description: 'Manual Registration.\n\n[TEST CREDENTIALS]\nUsername: lolo_pascual\nPassword: senior123',
    documents: ['BirthCertificate_PSA.pdf', 'BarangayClearance.jpg']
  },
  {
    id: 'app_reg_test_2',
    userId: 'temp_user_2',
    userName: 'Teresita "Tita" Reyes',
    type: ApplicationType.REGISTRATION,
    date: '2023-10-29',
    status: ApplicationStatus.PENDING,
    description: 'Online Registration.\n\n[TEST CREDENTIALS]\nUsername: tita_terry\nPassword: 123456',
    documents: ['ValidID.png']
  },
  // --- Dummy Data for ID Issuance Testing (Admin Portal) ---
  {
    id: 'app_new_id_dummy',
    userId: 'u_new_applicant',
    userName: 'Maria Clara',
    type: ApplicationType.ID_NEW,
    date: '2023-11-01',
    status: ApplicationStatus.APPROVED, // Ready for print
    description: 'New Applicant. Requirements verified.',
  },
  {
    id: 'app_renew_id_dummy',
    userId: 'u_renew_applicant',
    userName: 'Crisostomo Ibarra',
    type: ApplicationType.ID_RENEWAL,
    date: '2023-11-02',
    status: ApplicationStatus.APPROVED, // Ready for print
    description: 'Renewal application. Old ID surrended.',
  },
  {
    id: 'app_replace_id_dummy',
    userId: 'u_replace_applicant',
    userName: 'Elias Salome',
    type: ApplicationType.ID_REPLACEMENT,
    date: '2023-11-03',
    status: ApplicationStatus.APPROVED, // Ready for print
    description: 'Replacement. Affidavit of Loss submitted.',
  },
  // -------------------------------------------
  {
    id: 'app_juan_issued',
    userId: 'u_dummy',
    userName: 'Juan Dela Cruz',
    type: ApplicationType.ID_NEW,
    date: '2023-01-15',
    status: ApplicationStatus.ISSUED,
    description: 'Initial Registration (Issued)',
  },
  {
    id: 'app1',
    userId: 'u1',
    userName: 'Martha Stewart',
    type: ApplicationType.ID_RENEWAL,
    date: '2023-10-25',
    status: ApplicationStatus.PENDING,
    description: 'Requesting renewal for ID expiring next month.',
  },
  {
    id: 'app2',
    userId: 'u2',
    userName: 'Arthur Doyle',
    type: ApplicationType.REGISTRATION,
    date: '2023-10-26',
    status: ApplicationStatus.APPROVED,
    description: 'New senior citizen registration.',
  },
  {
    id: 'app3',
    userId: 'u1',
    userName: 'Martha Stewart',
    type: ApplicationType.BENEFIT_CASH,
    date: '2023-10-20',
    status: ApplicationStatus.ISSUED,
    description: 'Annual cash gift claiming.',
  },
  {
    id: 'app4',
    userId: 'u2',
    userName: 'Arthur Doyle',
    type: ApplicationType.PHILHEALTH,
    date: '2023-10-27',
    status: ApplicationStatus.PENDING,
    description: 'PhilHealth Member Data Record update.',
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'Martha Stewart',
    date: '2023-10-15',
    subject: 'Delayed Pension',
    details: 'I have not received my social pension for the last 2 months. I visited the office but was told to wait.',
    status: 'Open',
  },
];

export const INITIAL_REGISTRY_RECORDS: RegistryRecord[] = [
  { 
    id: 'LCR-2024-001', 
    type: 'LCR', 
    firstName: 'Ricardo', 
    middleName: 'Santos',
    lastName: 'Dalisay',
    suffix: '', 
    citizenship: 'Filipino',
    birthDate: '1955-03-15', 
    birthPlace: 'San Juan City',
    sex: 'Male',
    civilStatus: 'Married',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 1',
    barangay: 'Tibagan',
    street: 'F. Blumentritt',
    houseNo: '155',
    address: '155 F. Blumentritt, San Juan', // Fallback
    isRegistered: false 
  },
  { 
    id: 'PWD-2024-888', 
    type: 'PWD', 
    firstName: 'Leonora', 
    middleName: 'Cruz',
    lastName: 'Rivera', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1960-08-20', 
    birthPlace: 'Quezon City',
    sex: 'Female',
    civilStatus: 'Widowed',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 2',
    barangay: 'Corazon de Jesus',
    street: 'N. Domingo St',
    houseNo: '22',
    address: '22 N. Domingo St, San Juan',
    isRegistered: true 
  },
  { 
    id: 'LCR-1950-555', 
    type: 'LCR', 
    firstName: 'Emilio', 
    middleName: 'Famy',
    lastName: 'Aguinaldo',
    suffix: 'Jr',
    citizenship: 'Filipino',
    birthDate: '1950-01-01', 
    birthPlace: 'Cavite',
    sex: 'Male',
    civilStatus: 'Widowed',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 1',
    barangay: 'Tibagan',
    street: 'Cavite St',
    houseNo: '101',
    address: 'Cavite St, Brgy Tibagan',
    isRegistered: false 
  },
  { 
    id: 'LCR-1980-123', 
    type: 'LCR', 
    firstName: 'Jose', 
    middleName: 'Protacio',
    lastName: 'Rizal',
    suffix: '',
    citizenship: 'Filipino', 
    birthDate: '1980-06-19', 
    birthPlace: 'Calamba, Laguna',
    sex: 'Male',
    civilStatus: 'Single',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 1',
    barangay: 'Onse',
    street: 'Calamba St',
    houseNo: '44',
    address: 'Calamba St, Brgy Onse',
    isRegistered: false 
  },
];
