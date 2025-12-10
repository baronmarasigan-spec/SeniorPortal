
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Application, Complaint, Role, ApplicationStatus, RegistryRecord } from '../types';
import { INITIAL_USERS, INITIAL_APPLICATIONS, INITIAL_COMPLAINTS, INITIAL_REGISTRY_RECORDS } from '../services/mockData';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  users: User[];
  applications: Application[];
  complaints: Complaint[];
  registryRecords: RegistryRecord[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'date'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, reason?: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => void;
  verifyIdentity: (id: string) => RegistryRecord | undefined;
  issueIdCard: (appId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [registryRecords] = useState<RegistryRecord[]>(INITIAL_REGISTRY_RECORDS);

  const login = (username: string, password: string) => {
    // Strict authentication against mock database
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addApplication = (appData: Omit<Application, 'id' | 'status' | 'date'>) => {
    const newApp: Application = {
      ...appData,
      id: `app${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: ApplicationStatus.PENDING,
    };
    setApplications(prev => [newApp, ...prev]);
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, reason?: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { ...app, status, rejectionReason: reason } 
        : app
    ));
  };

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'status' | 'date'>) => {
     const newComplaint: Complaint = {
         ...complaintData,
         id: `c${Date.now()}`,
         date: new Date().toISOString().split('T')[0],
         status: 'Open'
     }
     setComplaints(prev => [newComplaint, ...prev]);
  }

  const verifyIdentity = (id: string) => {
    return registryRecords.find(r => r.id.toLowerCase() === id.toLowerCase());
  }

  const issueIdCard = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const today = new Date();
    const expiry = new Date(today);
    expiry.setFullYear(today.getFullYear() + 3); // 3 Years Validity

    const issueDateStr = today.toISOString().split('T')[0];
    const expiryDateStr = expiry.toISOString().split('T')[0];

    // Generate ID number if not exists
    const newIdNumber = `SC-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update User Record
    setUsers(prev => prev.map(u => {
      if (u.id === app.userId) {
        return {
          ...u,
          seniorIdNumber: u.seniorIdNumber || newIdNumber,
          seniorIdIssueDate: issueDateStr,
          seniorIdExpiryDate: expiryDateStr
        };
      }
      return u;
    }));

    // Update Application Status
    updateApplicationStatus(appId, ApplicationStatus.ISSUED);
  };

  // Sync current user if their record is updated (e.g., ID issued while logged in, though rare for admin action)
  useEffect(() => {
     if (currentUser) {
         const updatedUser = users.find(u => u.id === currentUser.id);
         if (updatedUser && (updatedUser.seniorIdNumber !== currentUser.seniorIdNumber || updatedUser.seniorIdExpiryDate !== currentUser.seniorIdExpiryDate)) {
             setCurrentUser(updatedUser);
         }
     }
  }, [users]);

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      users, 
      applications, 
      complaints,
      registryRecords,
      addApplication,
      updateApplicationStatus,
      addComplaint,
      verifyIdentity,
      issueIdCard
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
