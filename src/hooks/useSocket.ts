import { useEffect, useState, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';

// Changed any to unknown
export const useSocket = (onMessage: (data: unknown) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    
    const messageHandlerRef = useRef(onMessage);

    useEffect(() => {
        messageHandlerRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        connectSocket(
            (data) => {
                if (messageHandlerRef.current) {
                    messageHandlerRef.current(data);
                }
            },
            (status) => setIsConnected(status)
        );

        return () => {
            disconnectSocket();
            setIsConnected(false);
        };
    }, []); 

    return isConnected;
};