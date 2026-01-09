
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Application, Complaint, Role, ApplicationStatus, RegistryRecord, ApplicationType } from '../types';
import { INITIAL_USERS, INITIAL_APPLICATIONS, INITIAL_COMPLAINTS, INITIAL_REGISTRY_RECORDS } from '../services/mockData';
import { notifyStatusUpdate } from '../services/notification';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
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

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('https://api-dbosca.phoenix.com.ph/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        const apiUser = data.user || data;
        const apiRoleRaw = apiUser.role;
        const apiRoleStr = apiRoleRaw?.toString().toUpperCase();
        
        let assignedRole: Role = Role.CITIZEN;
        
        // Explicit Role Mapping based on provided requirements
        if (apiRoleRaw === 1 || apiRoleStr === '1') {
          assignedRole = Role.SUPER_ADMIN;
        } else if (apiRoleRaw === 5 || apiRoleStr === '5') {
          assignedRole = Role.CITIZEN;
        } else if (apiRoleStr === 'ADMIN') {
          assignedRole = Role.ADMIN;
        } else if (apiRoleStr === 'LCR_PWD_ADMIN') {
          assignedRole = Role.LCR_PWD_ADMIN;
        }

        const loggedInUser: User = {
          id: apiUser.id || `api_${Date.now()}`,
          name: apiUser.name || apiUser.fullname || username,
          role: assignedRole,
          email: apiUser.email || '',
          avatarUrl: apiUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          username: username,
        };
        setCurrentUser(loggedInUser);
        return loggedInUser;
      }
    } catch (error) {
      console.error("Login API Error (Phoenix):", error);
    }

    const mockUser = users.find(u => u.username === username && u.password === password);
    if (mockUser) {
      setCurrentUser(mockUser);
      return mockUser;
    }
    
    return null;
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
    setApplications(prev => {
      const updated = prev.map(app => {
        if (app.id === id) {
          const user = users.find(u => u.id === app.userId);
          
          if (app.type === ApplicationType.REGISTRATION && status === ApplicationStatus.APPROVED) {
            if (!user) {
              const birthDateMatch = app.description.match(/Birth Date: (.*)/);
              const addressMatch = app.description.match(/Address: (.*)/);
              const emailMatch = app.description.match(/Email: (.*)/);
              
              const newUser: User = {
                id: app.userId,
                name: app.userName,
                role: Role.CITIZEN,
                email: emailMatch ? emailMatch[1].trim() : '',
                birthDate: birthDateMatch ? birthDateMatch[1].trim() : '',
                address: addressMatch ? addressMatch[1].trim() : '',
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.userName}`,
                username: app.userName.toLowerCase().replace(/\s/g, ''),
                password: 'password123'
              };
              setUsers(oldUsers => [...oldUsers, newUser]);
            } else if (user.role !== Role.CITIZEN) {
              setUsers(oldUsers => oldUsers.map(u => u.id === app.userId ? { ...u, role: Role.CITIZEN } : u));
            }
          }

          if (user || app.userName) {
            notifyStatusUpdate(
              user?.name || app.userName, 
              user?.contactNumber || '', 
              user?.email || '', 
              app.type, 
              status, 
              reason
            );
          }
          return { ...app, status, rejectionReason: reason };
        }
        return app;
      });
      return updated;
    });
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
    expiry.setFullYear(today.getFullYear() + 3);

    const issueDateStr = today.toISOString().split('T')[0];
    const expiryDateStr = expiry.toISOString().split('T')[0];
    const newIdNumber = `SC-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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

    updateApplicationStatus(appId, ApplicationStatus.ISSUED);
  };

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
