'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { SessionUser } from './auth';

interface AuthContextType {
  user: SessionUser | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
