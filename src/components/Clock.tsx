import { useState, useEffect, memo } from 'react';

interface ClockProps {
    color?: string; 
}

function Clock({ color = '#d42228' }: ClockProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // 50ms interval to keep the milliseconds looking smooth
        const timer = setInterval(() => setTime(new Date()), 50);
        return () => clearInterval(timer);
    }, []);

    // Quick formatting helper
    const formatTime = (date: Date) => {
        const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
    };

    return (
        <div 
            className="digital-clock" 
            style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: color, // Dynamic color from props
                background: '#f1f5f9',
                padding: '0.5rem 2rem',
                borderRadius: '8px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #cbd5e1',
                minWidth: '350px',
                textAlign: 'center'
            }}
        >
            {formatTime(time)}
        </div>
    );
}

export const MemoizedClock = memo(Clock);