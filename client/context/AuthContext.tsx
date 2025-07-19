import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

// Real user storage in localStorage
const USERS_STORAGE_KEY = "mangafas_users";
const CURRENT_USER_KEY = "mangafas_current_user";

// Default admin user as specified in requirements
const DEFAULT_ADMIN: User = {
  id: "admin-1",
  name: "حمزة",
  email: "hamza232324ya@gmail.com",
  role: "site_admin",
  createdAt: "2024-01-01",
  lastLogin: new Date().toISOString(),
  notifications: 0,
};

// Initialize default users if not exists
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    const defaultUsers = [DEFAULT_ADMIN];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  }
};

const getStoredUsers = (): User[] => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initializeUsers();
    // Note: We don't auto-login users, they need to explicitly login
    // const currentUser = getCurrentUser();
    // if (currentUser) {
    //   setUser(currentUser);
    // }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = getStoredUsers();
    const foundUser = users.find((u) => u.email === email);

    // Check admin credentials
    if (email === "hamza232324ya@gmail.com" && password === "hamza2009") {
      const adminUser = {
        ...DEFAULT_ADMIN,
        lastLogin: new Date().toISOString(),
      };

      // Update admin in storage
      const updatedUsers = users.filter((u) => u.id !== DEFAULT_ADMIN.id);
      updatedUsers.push(adminUser);
      saveUsers(updatedUsers);

      setUser(adminUser);
      saveCurrentUser(adminUser);
      setIsLoading(false);
      return true;
    }

    // For now, just check if user exists (in real app, you'd hash and compare passwords)
    if (foundUser) {
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };

      // Update user's last login
      const updatedUsers = users.map((u) =>
        u.id === foundUser.id ? updatedUser : u,
      );
      saveUsers(updatedUsers);

      setUser(updatedUser);
      saveCurrentUser(updatedUser);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = getStoredUsers();

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      setIsLoading(false);
      return false;
    }

    const newUser: User = {
      id: "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: "user",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      notifications: 0,
    };

    // Save new user to storage
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    setUser(newUser);
    saveCurrentUser(newUser);
    setIsLoading(false);
    return true;
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);

      // Update in users storage
      const users = getStoredUsers();
      const updatedUsers = users.map((u) =>
        u.id === user.id ? updatedUser : u,
      );
      saveUsers(updatedUsers);
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
