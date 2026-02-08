import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminContextType {
    isAdmin: boolean;
    isLoginModalOpen: boolean;
    login: (token: string) => void;
    logout: () => void;
    closeLoginModal: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Define functions first using useCallback to avoid dependency issues
    const logout = useCallback(() => {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
    }, []);

    const login = useCallback((token: string) => {
        localStorage.setItem('adminToken', token);
        setIsAdmin(true);
        setIsLoginModalOpen(false);
    }, []);

    const closeLoginModal = useCallback(() => {
        setIsLoginModalOpen(false);
    }, []);

    // Initialization effect
    useEffect(() => {
        console.log('AdminProvider: Initializing...');
        const token = localStorage.getItem('adminToken');
        if (token) {
            console.log('AdminProvider: Found existing token, setting admin to true');
            setIsAdmin(true);
        }
    }, []);

    // Keyboard listener effect
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl + Shift + E
            if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'e' || e.code === 'KeyE')) {
                console.log('AdminProvider: Shortcut detected (Ctrl+Shift+E)');
                e.preventDefault();

                if (isAdmin) {
                    console.log('AdminProvider: User is admin, logging out...');
                    logout();
                } else {
                    console.log('AdminProvider: User is not admin, opening login modal...');
                    setIsLoginModalOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAdmin, logout]);

    return (
        <AdminContext.Provider value={{ isAdmin, isLoginModalOpen, login, logout, closeLoginModal }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
