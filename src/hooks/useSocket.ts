import { useEffect, useState, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';

// Using 'unknown' creates a safety boundary—the component receiving the data
// needs to validate what it is before using it.
export const useSocket = (onMessage: (data: unknown) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    
    // -- Stable Handler Pattern --
    // We store the latest 'onMessage' function in a ref. This allows the 
    // socket subscription (created in the effect below) to always call the 
    // most recent version of the function without needing to re-run the 
    // connection logic whenever the function identity changes.
    const messageHandlerRef = useRef(onMessage);

    useEffect(() => {
        messageHandlerRef.current = onMessage;
    }, [onMessage]);

    // -- Connection Lifecycle --

    useEffect(() => {
        // Wrapper to safely call the current ref
        const handleIncomingData = (data: unknown) => {
            if (messageHandlerRef.current) {
                messageHandlerRef.current(data);
            }
        };

        const handleStatusChange = (status: boolean) => {
            setIsConnected(status);
        };

        // Initialize connection
        connectSocket(handleIncomingData, handleStatusChange);

        // Cleanup on unmount
        return () => {
            disconnectSocket();
            setIsConnected(false);
        };
    }, []); // Empty array ensures we only connect once on mount

    return isConnected;
};