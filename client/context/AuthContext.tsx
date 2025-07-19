import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole =
  | "user"
  | "beginner_fighter"
  | "elite_fighter"
  | "tribe_leader"
  | "admin"
  | "site_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  notifications: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock default admin user as specified in requirements
const DEFAULT_ADMIN: User = {
  id: "admin-1",
  name: "حمزة",
  email: "hamza232324ya@gmail.com",
  role: "site_admin",
  createdAt: "2024-01-01",
  lastLogin: new Date().toISOString(),
  notifications: 0,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_ADMIN); // Start with admin logged in for demo
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Mock authentication logic
    // In real app, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === "hamza232324ya@gmail.com" && password === "hamza2009") {
      setUser(DEFAULT_ADMIN);
      setIsLoading(false);
      return true;
    }

    // Mock other users for demo
    if (email.includes("@")) {
      const mockUser: User = {
        id: "user-" + Date.now(),
        name: "مستخدم تجريبي",
        email,
        role: "user",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        notifications: 3,
      };
      setUser(mockUser);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    // Mock registration logic
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: "user-" + Date.now(),
      name,
      email,
      role: "user",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      notifications: 0,
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const roleLabels: Record<UserRole, string> = {
  user: "مستخدم",
  beginner_fighter: "🥉 مقاتل مبتدئ",
  elite_fighter: "🥈 مقاتل نخبة",
  tribe_leader: "🥇 قائد القبيلة",
  admin: "🛡️ مدير",
  site_admin: "👑 مدير الموقع",
};

export const rolePermissions = {
  user: {
    canRead: true,
    canComment: true,
    canFavorite: true,
    canUpload: false,
    canModerate: false,
    canAdmin: false,
  },
  beginner_fighter: {
    canRead: true,
    canComment: true,
    canFavorite: true,
    canUpload: true, // Requires approval
    canModerate: false,
    canAdmin: false,
  },
  elite_fighter: {
    canRead: true,
    canComment: true,
    canFavorite: true,
    canUpload: true, // Requires approval
    canModerate: true, // Comments only
    canAdmin: false,
  },
  tribe_leader: {
    canRead: true,
    canComment: true,
    canFavorite: true,
    canUpload: true, // No approval needed
    canModerate: true,
    canAdmin: false,
  },
  admin: {
    canRead: true,
    canComment: true,
    canFavorite: true,
    canUpload: true,
    canModerate: true,
    canAdmin: true, // Users management
  },
  site_admin: {
    canRead: true,
    canComment: true,
    canFavorite: true,
    canUpload: true,
    canModerate: true,
    canAdmin: true, // Full site control
  },
};
