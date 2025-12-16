import { memo } from 'react';
import './NotificationToast.css';

interface ColorPickerProps {
    color: string;
    onColorSelect: (color: string) => void;
}

function ColorPicker({ color, onColorSelect }: ColorPickerProps) {
    return (
        <div style={{ position: 'relative', display: 'inline-block', width: '40px', height: '40px' }}>
            {/* Visual button (emoji only) */}
            <button
                type="button"
                className="secondary"
                style={{
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                }}
                title="Customize Theme"
            >
                🎨
            </button>

            {/* Invisible input overlay.
                It sits on top of the button so clicking the emoji actually triggers the OS color picker.
            */}
            <input
                type="color"
                value={color}
                onInput={(e) => onColorSelect(e.currentTarget.value)}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                }}
            />
        </div>
    );
}

export const MemoizedColorPicker = memo(ColorPicker);