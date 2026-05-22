import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user state from localStorage on startup
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Login calls standard DRF token endpoint first, then staff login to retrieve details
    const login = async (username, password, role) => {
        try {
            // 1. Authenticate with DRF SimpleJWT and obtain tokens
            const tokenRes = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password,
            });

            const { access, refresh } = tokenRes.data;

            // Save tokens to localStorage
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Set the Authorization header for subsequent API calls
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // 2. Fetch staff-specific role and details from the custom endpoint
            const staffRes = await api.post('auth/login/', {
                username,
                password,
                role,
            });

            const userData = {
                id: staffRes.data.id,
                name: staffRes.data.name,
                username: staffRes.data.username,
                role: staffRes.data.role,
            };

            // Save user details to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (err) {
            // Clean up localStorage if login sequence fails halfway
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];

            let errorMessage = 'Failed to authenticate.';
            if (err.response) {
                if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.data && err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response.status === 401) {
                    errorMessage = 'Invalid username or password.';
                }
            }
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
