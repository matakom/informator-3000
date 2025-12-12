import { useEffect } from 'react';
import { Article } from '../types';
import './NotificationToast.css';

interface Props {
    message: Article | null;
    onClose: () => void;
}

export default function NotificationToast({ message, onClose }: Props) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className="toast-container">
            <strong>Last Article published</strong>
            <div>{message.title}</div>
            <small>By {message.author}</small>
            <button className="toast-dismiss" onClick={onClose}>Dismiss</button>
        </div>
    );
}