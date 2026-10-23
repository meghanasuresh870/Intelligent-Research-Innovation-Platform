import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

function normalizeProfile(data = {}, currentUser = {}) {
  return {
    ...data,
    id: data.id ?? null,
    userId: data.user_id ?? null,
    fullName: data.name || currentUser.name || '',
    email: data.email || currentUser.email || '',
    role: data.role || currentUser.role || '',
    organization: data.organization || currentUser.organization || '',
    department: data.department || '',
    designation: data.designation || currentUser.designation || '',
    country: data.country || currentUser.country || '',
    researchDomain:
      data.research_domain || currentUser.research_domain || '',
    researchAreas: data.research_areas || [],
    researchInterests: data.research_interests || [],
    researchKeywords: data.research_keywords || [],
    technologyAreas: data.technology_areas || [],
    publications: data.publications || [],
    patents: data.patents || [],
  };
}

function profilePayload(form = {}) {
  return {
    name: form.fullName ?? form.name ?? '',
    organization: form.organization ?? '',
    department: form.department ?? '',
    designation: form.designation ?? '',
    country: form.country ?? '',
    research_domain: form.researchDomain ?? form.research_domain ?? '',
    research_areas: form.researchAreas ?? form.research_areas ?? [],
    research_interests:
      form.researchInterests ?? form.research_interests ?? [],
    research_keywords:
      form.researchKeywords ?? form.research_keywords ?? [],
    technology_areas:
      form.technologyAreas ?? form.technology_areas ?? [],
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('auth_token') || ''
  );

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(
    !!localStorage.getItem('auth_token')
  );
  const [profileLoading, setProfileLoading] = useState(
    !!localStorage.getItem('auth_token')
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('auth_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('auth_profile');
    }
  }, [profile]);

  const refreshUser = useCallback(async () => {
    const data = await apiRequest('/users/me');
    setUser(data);
    return data;
  }, []);

  const refreshProfile = useCallback(async (currentUser = user) => {
    setProfileLoading(true);

    try {
      const data = await apiRequest('/profile');
      const normalized = normalizeProfile(data, currentUser || {});
      setProfile(normalized);
      return normalized;
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setProfileLoading(false);
      setUser(null);
      setProfile(null);
      return;
    }

    let cancelled = false;

    async function loadAccount() {
      setLoading(true);
      setProfileLoading(true);

      try {
        const currentUser = await apiRequest('/users/me');

        if (cancelled) return;

        setUser(currentUser);

        try {
          const profileData = await apiRequest('/profile');

          if (!cancelled) {
            setProfile(normalizeProfile(profileData, currentUser));
          }
        } catch (profileError) {
          // Keep authentication if the separate profile request fails.
          // Report the error so the API problem can be diagnosed.
          console.error('Could not load research profile:', profileError);
          if (!cancelled) {
            setProfile(normalizeProfile({}, currentUser));
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Could not verify the logged-in user:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_profile');
          setToken('');
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setProfileLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.removeItem('auth_profile');

    setToken(newToken);
    setUser(newUser);
    setProfile(null);
    setLoading(false);
    setProfileLoading(true);
  }, []);

  const updateProfile = useCallback(async (form) => {
    const payload = profilePayload(form);

    const data = await apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const normalized = normalizeProfile(data, user);
    setProfile(normalized);

    // Refresh user data so the sidebar uses the latest saved details.
    try {
      const currentUser = await apiRequest('/users/me');
      setUser(currentUser);
      setProfile(normalizeProfile(data, currentUser));
    } catch (error) {
      console.error('Profile saved, but user details could not refresh:', error);
    }

    return normalized;
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_profile');

    setToken('');
    setUser(null);
    setProfile(null);
    setLoading(false);
    setProfileLoading(false);

    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      role: user?.role ?? profile?.role ?? null,
      isAuthenticated: !!token && !!user,
      loading,
      profileLoading,
      login,
      logout,
      refreshUser,
      refreshProfile,
      updateProfile,
    }),
    [
      token,
      user,
      profile,
      loading,
      profileLoading,
      login,
      logout,
      refreshUser,
      refreshProfile,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return ctx;
}