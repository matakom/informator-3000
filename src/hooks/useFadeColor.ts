import { useState, useRef, useCallback, useEffect } from 'react';

const DEFAULT_HEX = '#d42228';
const FADE_DURATION = 10000; 
const HOLD_DURATION = 2000; 

// Hex <-> RGB helpers
const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

export function useFadeColor() {
    const [currentColor, setCurrentColor] = useState(DEFAULT_HEX);
    
    // Refs to keep track of the animation loop so we can kill it if needed
    const animationRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const triggerColorChange = useCallback((targetColor: string) => {
        // Kill existing animations before starting a new one
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Snap to target immediately
        setCurrentColor(targetColor);

        // Hold for 2s, then fade back to default over 10s
        timeoutRef.current = setTimeout(() => {
            const startRgb = hexToRgb(targetColor);
            const endRgb = hexToRgb(DEFAULT_HEX);
            const startTime = performance.now();

            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / FADE_DURATION, 1);

                const r = lerp(startRgb[0], endRgb[0], progress);
                const g = lerp(startRgb[1], endRgb[1], progress);
                const b = lerp(startRgb[2], endRgb[2], progress);

                setCurrentColor(rgbToHex(r, g, b));

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setCurrentColor(DEFAULT_HEX); 
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        }, HOLD_DURATION) as unknown as number;

    }, []);

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return { currentColor, triggerColorChange };
}