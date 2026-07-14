import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ems_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user ?? null);
        setToken(parsed.token ?? null);
      }
    } catch {
      localStorage.removeItem('ems_auth');
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('ems_auth');
    setUser(null);
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('ems:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ems:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = (userData, tokenData = null) => {
    const payload = { user: userData, token: tokenData };
    localStorage.setItem('ems_auth', JSON.stringify(payload));
    setUser(userData);
    setToken(tokenData);
  };

  const isAuthenticated = !loading && !!user;

  const hasPrivilege = (id) =>
    (user?.privilegeIds ?? []).includes(Number(id));

  const hasPrivilegeByName = (name) =>
    (user?.privileges ?? []).some(
      (p) => p.name?.toLowerCase() === name?.toLowerCase()
    );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        hasPrivilege,
        hasPrivilegeByName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
