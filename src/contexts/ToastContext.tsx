import React, { createContext, useContext } from 'react';
import { useToast as useChakraToast } from '@chakra-ui/toast';

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const toast = useChakraToast();
    return (
        <ToastContext.Provider value={toast}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === null) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
