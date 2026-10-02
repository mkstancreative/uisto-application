import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import {
  changePassword as apiChangePassword,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  logoutAll as apiLogoutAll,
  updateMe,
} from '../api/services/auth';
import {
  REFRESH_STORAGE_KEY,
  SESSION_EXPIRED_EVENT,
  clearSession,
  hasStoredSession,
  refreshSession,
  setSession,
} from '../api/session';

/*
  status:
    'loading'        → restoring a stored session on first load
    'authenticated'  → user is signed in (may still need a password change)
    'anonymous'      → signed out
*/
export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (hasStoredSession() ? 'loading' : 'anonymous'));

  const endSession = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  /* Restore the session from the stored refresh token */
  useEffect(() => {
    if (!hasStoredSession()) return undefined;
    let cancelled = false;
    refreshSession()
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        setStatus('authenticated');
      })
      .catch((err) => {
        if (cancelled) return;
        // Only discard the token when the server rejected it, not on a network blip
        const rejected = err?.response?.status >= 400 && err?.response?.status < 500;
        if (rejected) clearSession();
        setUser(null);
        setStatus('anonymous');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* A failed refresh anywhere in the app ends the session */
  useEffect(() => {
    const onExpired = () => endSession();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [endSession]);

  /* Signing out in another tab signs this tab out too */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === REFRESH_STORAGE_KEY && !e.newValue && user) endSession();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [endSession, user]);

  const login = useCallback(async ({ email, password }) => {
    const res = await apiLogin({ email: email.trim(), password });
    setSession(res.data);
    setUser(res.data.user);
    setStatus('authenticated');
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    endSession();
  }, [endSession]);

  /** Revoke every session for this user, including this one. */
  const logoutEverywhere = useCallback(async () => {
    await apiLogoutAll();
    endSession();
  }, [endSession]);

  /** Other devices are signed out; this device receives a fresh token pair. */
  const changePassword = useCallback(async (payload) => {
    const res = await apiChangePassword(payload);
    setSession(res.data);
    setUser(res.data.user);
    return res;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const res = await updateMe(payload);
    setUser(res.data);
    return res;
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getMe();
    setUser(res.data);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      loading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      login,
      logout,
      logoutEverywhere,
      changePassword,
      updateProfile,
      refreshUser,
    }),
    [user, status, login, logout, logoutEverywhere, changePassword, updateProfile, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
