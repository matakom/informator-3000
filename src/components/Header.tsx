import { memo } from 'react';
import { MemoizedClock } from './Clock';

interface HeaderProps {
    isApiConnected: boolean;
    isSocketConnected: boolean;
    accentColor: string; 
}

function Header({ isApiConnected, isSocketConnected, accentColor }: HeaderProps) {
    return (
        <header className="app-header">
            <div className="header-left">
                <img src="/logo/full.png" alt="logo" height={60} style={{ display: 'block' }} />
            </div>

            <div className="header-center">
                <MemoizedClock color={accentColor} />
            </div>

            <div className="header-right">
                <span>
                    REST API: {isApiConnected ? 
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Online</span> : 
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● Offline</span>}
                </span>
                <span>
                    Real-time: {isSocketConnected ? 
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Live</span> : 
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>● Connecting...</span>}
                </span>
            </div>
        </header>
    );
}

export const MemoizedHeader = memo(Header);