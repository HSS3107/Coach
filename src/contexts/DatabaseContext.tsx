import React, { createContext, useContext } from 'react';

// Simplified Context for LocalStorage mode
interface DatabaseContextType {
    db: any; // Truthy value to satisfy checks
    isLoading: boolean;
    error: Error | null;
    statusMsg: string;
}

const DatabaseContext = createContext<DatabaseContextType>({
    db: {},
    isLoading: false,
    error: null,
    statusMsg: 'Ready',
});

export const useDb = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In LocalStorage mode, we are always ready.
    return (
        <DatabaseContext.Provider value={{ db: {}, isLoading: false, error: null, statusMsg: 'Ready' }}>
            {children}
        </DatabaseContext.Provider>
    );
};
