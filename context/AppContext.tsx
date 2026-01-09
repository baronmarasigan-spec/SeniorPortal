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

// Hook to use the AppContext, used by multiple components throughout the app
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [registryRecords] = useState<RegistryRecord[]>(INITIAL_REGISTRY_RECORDS);

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      // Logic to determine role hint for the request body
      const isCitizen = username.toUpperCase().startsWith('OSCA.');
      const loginPayload: any = { username, password };
      
      // Ensure the role (5 for citizens) is mapped to the respective field in the request body as a string
      if (isCitizen) {
        loginPayload.role = "5";
      } else if (username === 'admin') {
        loginPayload.role = "1"; // Assuming 1 for admins based on previous mappings
      }

      const response = await fetch('https://api-dbosca.phoenix.com.ph/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginPayload)
      });

      if (response.ok) {
        const data = await response.json();
        const apiUser = data.user || data;
        const apiRoleRaw = apiUser.role;
        const apiRoleStr = apiRoleRaw?.toString().toUpperCase();
        
        let assignedRole: Role = Role.CITIZEN;
        
        // Role Mapping: 1 = Admin/SuperAdmin, 5 = Citizen
        if (apiRoleRaw === 1 || apiRoleStr === '1' || apiRoleStr === 'SUPER ADMIN' || apiRoleStr === 'ADMIN') {
          assignedRole = Role.ADMIN;
          if (apiRoleStr === 'SUPER ADMIN') assignedRole = Role.SUPER_ADMIN;
        } else if (apiRoleRaw === 5 || apiRoleStr === '5' || apiRoleStr === 'CITIZEN') {
          assignedRole = Role.CITIZEN;
        }

        const loggedInUser: User = {
          id: apiUser.id || `api_${Date.now()}`,
          name: apiUser.name || apiUser.fullname || username,
          role: assignedRole,
          email: apiUser.email || '',
          avatarUrl: apiUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          username: username,
          seniorIdNumber: apiUser.senior_id_number || apiUser.seniorIdNumber,
        };
        setCurrentUser(loggedInUser);
        return loggedInUser;
      }
    } catch (error) {
      console.error("Login API Error:", error);
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

  const updateApplicationStatus = async (id: string, status: ApplicationStatus, reason?: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    if (app.type === ApplicationType.REGISTRATION && status === ApplicationStatus.APPROVED) {
      const userExists = users.find(u => u.id === app.userId);
      
      if (!userExists) {
        // Parse details for credential generation
        const birthDateMatch = app.description.match(/Birth Date: (.*)/);
        const emailMatch = app.description.match(/Email: (.*)/);
        const addressMatch = app.description.match(/Address: (.*)/);
        const firstNameMatch = app.description.match(/First Name: (.*)/);
        const lastNameMatch = app.description.match(/Last Name: (.*)/);
        
        const bDate = birthDateMatch ? birthDateMatch[1].trim() : '1960-01-01';
        const bYear = new Date(bDate).getFullYear();
        const fNameRaw = firstNameMatch ? firstNameMatch[1].trim() : 'Juan';
        const lNameRaw = lastNameMatch ? lastNameMatch[1].trim() : 'Dela Cruz';
        const fInitial = fNameRaw.charAt(0).toLowerCase();
        const lNameClean = lNameRaw.toLowerCase().replace(/[^a-z]/g, '');
        
        /**
         * Username: Format (OSCA.Initial Firstname,Lastname.year of Birth)
         * Sample: OSCA.jmaagad.1950
         */
        const generatedUsername = `OSCA.${fInitial}${lNameClean}.${bYear}`;
        
        /**
         * Password: Format osca+6random numbers
         * Sample: osca541214
         */
        const generatedPassword = `osca${Math.floor(100000 + Math.random() * 900000)}`;

        const newUser: User = {
          id: app.userId,
          name: app.userName,
          role: Role.CITIZEN,
          email: emailMatch ? emailMatch[1].trim() : '',
          birthDate: bDate,
          address: addressMatch ? addressMatch[1].trim() : '',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.userName}`,
          username: generatedUsername,
          password: generatedPassword
        };

        // SYNC TO DATABASE VIA API
        try {
          // Correctly map role ("5" as a string for citizens) and credentials to the request body
          const apiSaveResponse = await fetch('https://api-dbosca.phoenix.com.ph/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name: newUser.name,
              username: newUser.username,
              password: newUser.password,
              password_confirmation: newUser.password,
              role: "5", // Citizens MUST be role "5" (string) as per API validation
              email: newUser.email,
              address: newUser.address,
              birth_date: newUser.birthDate
            })
          });

          if (apiSaveResponse.ok) {
            console.log(`[API-SYNC] User ${newUser.username} successfully saved to backend database.`);
          } else {
            const errorBody = await apiSaveResponse.json().catch(() => ({}));
            console.warn(`[API-SYNC] Backend sync failed with status ${apiSaveResponse.status}:`, errorBody);
          }
        } catch (apiErr) {
          console.error("[API-SYNC] Critical error during user persistence:", apiErr);
        }

        setUsers(oldUsers => [...oldUsers, newUser]);
      } else if (userExists.role !== Role.CITIZEN) {
        setUsers(oldUsers => oldUsers.map(u => u.id === app.userId ? { ...u, role: Role.CITIZEN } : u));
      }
    }

    setApplications(prev => prev.map(a => {
      if (a.id === id) {
        const user = users.find(u => u.id === a.userId);
        notifyStatusUpdate(
          user?.name || a.userName, 
          user?.contactNumber || '', 
          user?.email || '', 
          a.type, 
          status, 
          reason
        );
        return { ...a, status, rejectionReason: reason };
      }
      return a;
    }));
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
          seniorIdIssueDate: u.seniorIdIssueDate || issueDateStr,
          seniorIdExpiryDate: u.seniorIdExpiryDate || expiryDateStr
        };
      }
      return u;
    }));

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: ApplicationStatus.ISSUED } : a));
  };

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