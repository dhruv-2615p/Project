import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.validate(token)
        .then((data) => {
          setUser({ fullName: data.fullName, email: data.email, role: data.role || 'CUSTOMER' });
        })
        .catch(() => {
          authService.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    authService.saveAuth(data);
    setUser({ fullName: data.fullName, email: data.email, role: data.role || 'CUSTOMER' });
    return data;
  };

  const register = async (fullName, email, password) => {
    const data = await authService.register(fullName, email, password);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
