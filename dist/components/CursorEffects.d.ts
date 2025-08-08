import React from 'react';
interface CursorEffectsProps {
    enabled?: boolean;
    particleCount?: number;
    trailLength?: number;
    colors?: string[];
    className?: string;
}
declare const CursorEffects: React.FC<CursorEffectsProps>;
export declare const useCursorEffects: () => {
    enabled: any;
    config: any;
    toggleEffects: () => any;
    updateConfig: (newConfig: Partial<any>) => void;
    setEnabled: any;
};
export declare const cursorPresets: {
    rainbow: {
        colors: string[];
        particleCount: number;
        trailLength: number;
    };
    neon: {
        colors: string[];
        particleCount: number;
        trailLength: number;
    };
    ocean: {
        colors: string[];
        particleCount: number;
        trailLength: number;
    };
    fire: {
        colors: string[];
        particleCount: number;
        trailLength: number;
    };
    minimal: {
        colors: string[];
        particleCount: number;
        trailLength: number;
    };
};
export default CursorEffects;
