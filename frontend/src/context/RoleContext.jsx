import { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');

    const login = (password) => {
        setAdminPassword(password);
        setIsAdmin(true);
    };

    const logout = () => {
        setAdminPassword('');
        setIsAdmin(false);
    };

    return (
        <RoleContext.Provider value={{ isAdmin, adminPassword, login, logout }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within RoleProvider');
    }
    return context;
};
