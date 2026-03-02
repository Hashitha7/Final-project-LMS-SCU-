import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_TOKEN_KEY = 'eduflow-auth-token';
const STORAGE_USER_KEY = 'eduflow-auth-user';
const STORAGE_RESET_KEY = 'eduflow-reset-token';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

/**
 * Decode a real JWT payload (base64url) without verifying signature.
 * Returns null if invalid.
 */
function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        // Base64url decode
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function isTokenExpired(payload) {
    if (!payload || !payload.exp) return true;
    return Date.now() / 1000 > payload.exp;
}

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
    const [authMode, setAuthMode] = useState('email');
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    // On mount / token change: validate token and restore user
    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        const payload = decodeJwtPayload(token);
        if (!payload || isTokenExpired(payload)) {
            // Token is invalid or expired — clear everything
            setToken(null);
            setUser(null);
            localStorage.removeItem(STORAGE_TOKEN_KEY);
            localStorage.removeItem(STORAGE_USER_KEY);
            setLoading(false);
            return;
        }

        // Token is valid — restore user from localStorage (set during login)
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }
        setLoading(false);
    }, [token]);

    // Persist token to localStorage
    useEffect(() => {
        if (!token) {
            localStorage.removeItem(STORAGE_TOKEN_KEY);
        } else {
            localStorage.setItem(STORAGE_TOKEN_KEY, token);
        }
    }, [token]);

    const login = async ({ identifier, password, role }) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: identifier,
                password: password,
                role: role || ''
            })
        });

        if (!response.ok) {
            let msg = 'Invalid email or password';
            try {
                const err = await response.json();
                msg = err.message || msg;
            } catch { }
            throw new Error(msg);
        }

        const data = await response.json();

        // Build user object from login response
        const userData = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: (data.role || '').toLowerCase(),
        };

        // Persist user and token
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
        setUser(userData);
        setToken(data.accessToken);
    };

    const registerStudent = async ({ name, email, mobile, password, grade }) => {
        const response = await fetch('/api/auth/register/student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, mobile, password, grade: grade || '' })
        });

        if (!response.ok) {
            let msg = 'Registration failed';
            try {
                const err = await response.json();
                msg = err.message || msg;
            } catch { }
            throw new Error(msg);
        }

        // Auto-login after registration
        await login({ identifier: email, password, role: 'STUDENT' });
    };

    const requestPasswordReset = async ({ identifier }) => {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier })
        });

        if (!response.ok) {
            throw new Error('No user found for that identifier');
        }

        return { message: 'Password reset instructions sent' };
    };

    const resetPassword = async ({ resetToken, newPassword }) => {
        if (!resetToken) throw new Error('Reset token missing');
        if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
    };

    const hasRole = (roles) => {
        if (!user) return false;
        const list = Array.isArray(roles) ? roles : [roles];
        return list.some(r => r.toLowerCase() === (user.role || '').toLowerCase());
    };

    const value = useMemo(() => ({
        user,
        token,
        authMode,
        setAuthMode,
        login,
        registerStudent,
        requestPasswordReset,
        resetPassword,
        logout,
        hasRole,
        loading,
    }), [user, token, authMode, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

