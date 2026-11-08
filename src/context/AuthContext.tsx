import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "@/lib/token-storage";
import { logoutSession } from "@/api/auth";
import { subscribeToAuthInvalidation } from "./auth-events";
import { sessionCoordinator } from "./session-coordinator";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthInvalidation(() => {
      setIsAuthenticated(false);
    });

    const restoreSession = async () => {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);
        const hasSession = Boolean(accessToken && refreshToken);

        if (!hasSession && (accessToken || refreshToken)) {
          await clearTokens();
        }

        setIsAuthenticated(hasSession);
      } catch (error) {
        console.error("Session restoration failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    const refreshSettled = sessionCoordinator.beginLogout();
    setIsAuthenticated(false);

    try {
      await refreshSettled;
      const refreshToken =
        sessionCoordinator.latestRefreshToken ?? (await getRefreshToken());
      if (refreshToken) {
        await logoutSession(refreshToken);
      }
    } catch (error) {
      console.warn("Server logout failed; clearing the local session.");
    } finally {
      try {
        await clearTokens();
      } finally {
        sessionCoordinator.clearRefreshTokenForLogout();
        setIsAuthenticated(false);
      }
    }
  };

  const login = async () => {
    const [accessToken, refreshToken] = await Promise.all([
      getAccessToken(),
      getRefreshToken(),
    ]);

    if (!accessToken || !refreshToken) {
      setIsAuthenticated(false);
      throw new Error("Authentication tokens were not persisted.");
    }

    sessionCoordinator.activateSession();
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
