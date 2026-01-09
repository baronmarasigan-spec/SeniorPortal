
import { Application, ApplicationStatus, ApplicationType, Complaint, RegistryRecord, Role, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u_dummy',
    name: 'Juan Dela Cruz',
    role: Role.CITIZEN,
    email: 'juan@email.com',
    birthDate: '1955-03-15',
    birthPlace: 'San Juan City',
    sex: 'Male',
    civilStatus: 'Married',
    address: '155 F. Blumentritt, San Juan',
    seniorIdNumber: 'SC-2024-DUMMY',
    seniorIdIssueDate: '2024-01-15',
    seniorIdExpiryDate: '2027-01-15', // 3 years validity
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    contactNumber: '0917 000 0000',
    emergencyContact: 'Maria Dela Cruz - 0917 111 1111',
    username: 'juan',
    password: 'password123',
    livingArrangement: 'Owned',
    isPensioner: true,
    pensionAmount: '5,000',
    pensionSource: 'SSS',
    hasIllness: true,
    illnessDetails: 'Hypertension',
    bloodType: 'O+'
  },
  {
    id: 'u_no_id',
    name: 'Pedro Penduko',
    role: Role.CITIZEN,
    email: 'pedro@email.com',
    birthDate: '1960-01-01',
    birthPlace: 'Quezon City',
    sex: 'Male',
    civilStatus: 'Widowed',
    address: 'Sample Address, San Juan City',
    seniorIdNumber: undefined, // No ID Issued
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    contactNumber: '0918 222 2222',
    emergencyContact: 'Pedro Jr. - 0918 333 3333',
    username: 'pedro',
    password: 'password123',
    livingArrangement: 'Living with Relatives',
    isPensioner: false,
    hasIllness: false
  },
  {
    id: 'u_new_applicant',
    name: 'Maria Clara',
    role: Role.CITIZEN,
    email: 'maria@example.com',
    birthDate: '1963-05-01',
    birthPlace: 'Manila',
    sex: 'Female',
    civilStatus: 'Single',
    address: 'Brgy. Corazon de Jesus, San Juan',
    seniorIdNumber: undefined, // Not yet issued
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    contactNumber: '0919 123 4567',
    livingArrangement: 'Rent',
    isPensioner: false,
    hasIllness: true,
    illnessDetails: 'Arthritis'
  },
  {
    id: 'u_renew_applicant',
    name: 'Crisostomo Ibarra',
    role: Role.CITIZEN,
    email: 'ibarra@example.com',
    birthDate: '1950-12-30',
    birthPlace: 'San Juan City',
    sex: 'Male',
    civilStatus: 'Widowed',
    address: 'Brgy. Greenhills, San Juan',
    seniorIdNumber: 'SC-2018-009', // Expiring ID
    seniorIdIssueDate: '2018-11-01',
    seniorIdExpiryDate: '2021-11-01', // Expired
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Crisostomo',
    contactNumber: '0920 987 6543',
    isPensioner: true,
    pensionAmount: '12,000',
    pensionSource: 'GSIS'
  },
  {
    id: 'u_replace_applicant',
    name: 'Elias Salome',
    role: Role.CITIZEN,
    email: 'elias@example.com',
    birthDate: '1958-06-19',
    sex: 'Male',
    civilStatus: 'Married',
    address: 'Brgy. West Crame, San Juan',
    seniorIdNumber: 'SC-2020-555', // Lost ID
    seniorIdIssueDate: '2020-05-15',
    seniorIdExpiryDate: '2023-05-15',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elias',
    contactNumber: '0921 555 5555',
    isPensioner: false
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
    password: 'password123',
    sex: 'Female',
    civilStatus: 'Widowed',
    isPensioner: true,
    pensionAmount: '150,000 (Annual)',
    pensionSource: 'Investments',
    hasIllness: false
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
    password: 'password123',
    sex: 'Male',
    civilStatus: 'Married',
    isPensioner: true,
    pensionAmount: '8,000',
    pensionSource: 'SSS',
    hasIllness: true,
    illnessDetails: 'Diabetes'
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
    userId: 'walkin_998877', 
    userName: 'Rolando "Lolo" Pascual',
    type: ApplicationType.REGISTRATION,
    date: '2023-10-28',
    status: ApplicationStatus.PENDING,
    description: `Walk-in Registration Details:
First Name: Rolando
Last Name: Pascual
Birth Date: 1952-11-12
Birth Place: San Juan City
Gender: Male
Civil Status: Married
Address: 12 B. Riverside St., San Juan
Email: rolando.pascual@test.ph
Phone: 0915 222 3344
Living: Owned
Pensioner: Yes
Pension Source: SSS
Pension Amount: 4500
Has Illness: Yes
Illness Details: Hypertension
Verified via Registry: LCR`,
    documents: ['BirthCertificate_PSA.pdf', 'BarangayClearance.jpg']
  },
  {
    id: 'app_reg_test_2',
    userId: 'temp_user_2',
    userName: 'Teresita "Tita" Reyes',
    type: ApplicationType.REGISTRATION,
    date: '2023-10-29',
    status: ApplicationStatus.PENDING,
    description: `Online Registration Details:
First Name: Teresita
Last Name: Reyes
Birth Date: 1958-05-15
Birth Place: Manila
Gender: Female
Civil Status: Widowed
Address: Unit 304, Green Park Condo, San Juan
Email: tita_terry@email.com
Phone: 0917 888 9900
Living: Rent
Pensioner: No
Pension Source: None
Pension Amount: 0
Has Illness: No
Illness Details: None
Verified via Registry: MANUAL`,
    documents: ['ValidID.png', 'Selfie_Verification.jpg']
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
    description: 'New senior citizen registration.\nBirth Date: 1949-11-22',
    documents: ['BirthCert.pdf', 'ValidID_Passport.jpg']
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
  },
  // New Dummy Data to show "For Approval" in Masterlist Benefits Column
  {
    id: 'app_benefit_pending_dummy',
    userId: 'u_dummy', // Juan Dela Cruz
    userName: 'Juan Dela Cruz',
    type: ApplicationType.BENEFIT_CASH,
    date: '2023-11-05',
    status: ApplicationStatus.PENDING,
    description: 'Application for Social Pension.',
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
    id: 'PWD-2024-101', 
    type: 'PWD', 
    firstName: 'Fernando', 
    middleName: 'Alonzo',
    lastName: 'Poe', 
    suffix: 'III',
    citizenship: 'Filipino',
    birthDate: '1975-11-12', 
    birthPlace: 'San Juan City',
    sex: 'Male',
    civilStatus: 'Married',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 1',
    barangay: 'Onse',
    street: 'A. Luna St',
    houseNo: '88',
    address: '88 A. Luna St, San Juan',
    isRegistered: false 
  },
  { 
    id: 'PWD-2024-505', 
    type: 'PWD', 
    firstName: 'Gloria', 
    middleName: 'Macapagal',
    lastName: 'Arroyo', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1947-04-05', 
    birthPlace: 'Lubao, Pampanga',
    sex: 'Female',
    civilStatus: 'Married',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 2',
    barangay: 'Greenhills',
    street: 'Connecticut St',
    houseNo: '12',
    address: '12 Connecticut St, San Juan',
    isRegistered: false 
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
  { 
    id: 'PWD-2025-001', 
    type: 'PWD', 
    firstName: 'Ramon', 
    middleName: 'Gomez',
    lastName: 'Bautista', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1958-02-14', 
    birthPlace: 'Pasig City',
    sex: 'Male',
    civilStatus: 'Married',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 2',
    barangay: 'West Crame',
    street: 'Bautista St',
    houseNo: '45',
    address: '45 West Crame, San Juan',
    isRegistered: false 
  },
  { 
    id: 'PWD-2025-002', 
    type: 'PWD', 
    firstName: 'Nicanor', 
    middleName: 'Abelardo',
    lastName: 'San Miguel', 
    suffix: 'Sr.',
    citizenship: 'Filipino',
    birthDate: '1962-12-25', 
    birthPlace: 'Bulacan',
    sex: 'Male',
    civilStatus: 'Widowed',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 1',
    barangay: 'Tibagan',
    street: 'San Miguel St',
    houseNo: '12',
    address: '12 Brgy Tibagan, San Juan',
    isRegistered: false 
  },
  { 
    id: 'PWD-2025-003', 
    type: 'PWD', 
    firstName: 'Liza', 
    middleName: 'Soberano',
    lastName: 'Mendoza', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1995-01-04', 
    birthPlace: 'California, USA',
    sex: 'Female',
    civilStatus: 'Single',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 2',
    barangay: 'Greenhills',
    street: 'Eisenhower St',
    houseNo: '302',
    address: 'Unit 302 Eisenhower Condominium',
    isRegistered: false 
  },
  { 
    id: 'PWD-2025-004', 
    type: 'PWD', 
    firstName: 'Paciano', 
    middleName: 'Mercado',
    lastName: 'Rizal', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1945-03-07', 
    birthPlace: 'Calamba, Laguna',
    sex: 'Male',
    civilStatus: 'Single',
    province: 'Metro Manila',
    city: 'San Juan',
    district: 'District 1',
    barangay: 'Onse',
    street: 'Calamba St',
    houseNo: '11',
    address: '11 Brgy Onse, San Juan',
    isRegistered: true 
  },
];
