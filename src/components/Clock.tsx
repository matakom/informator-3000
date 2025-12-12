import { useState, useEffect, memo } from 'react';

function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 50); // Fast update for milliseconds
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="digital-clock" style={{
            fontFamily: "'Courier New', Courier, monospace", // Monospace is crucial for clock stability
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#d42228',
            background: '#f1f5f9',
            padding: '0.5rem 2rem',
            borderRadius: '8px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #cbd5e1',
            minWidth: '350px',
            textAlign: 'center'
        }}>
            {formatTime(time)}
        </div>
    );
}


export default memo(Clock);