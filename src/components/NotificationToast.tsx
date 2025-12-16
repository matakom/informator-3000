import { useEffect, memo } from 'react';
import { Article } from '../types';
import './NotificationToast.css';

interface ToastProps {
    message: Article | null;
    onClose: () => void;
    accentColor?: string; 
}

function NotificationToast({ message, onClose, accentColor = '#d42228' }: ToastProps) {
    
    useEffect(() => {
        if (!message) return;
        // Auto-dismiss after 5s
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div 
            className="toast-container" 
            style={{ borderLeft: `6px solid ${accentColor}` }}
        >
            <strong style={{ color: accentColor }}>
                Last Article published
            </strong>
            
            <div>{message.title}</div>
            <small>By {message.author}</small>
            <button className="toast-dismiss" onClick={onClose}>Dismiss</button>
        </div>
    );
}

// Custom check to prevent unnecessary re-renders if the object ref changes but ID is same
function arePropsEqual(prev: ToastProps, next: ToastProps) {
    const prevId = prev.message?.id || null;
    const nextId = next.message?.id || null;
    
    return (
        prevId === nextId &&
        prev.onClose === next.onClose &&
        prev.accentColor === next.accentColor
    );
}

export const MemoizedNotificationToast = memo(NotificationToast, arePropsEqual);