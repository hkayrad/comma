import { createContext } from "react";

export interface User {
  username: string;
  role: number;
  companyId: string;
}

interface UserContextType {
  user: User | null;
  getUser: () => User | null;
  login: (username: string, password: string) => Promise<User | null>;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
