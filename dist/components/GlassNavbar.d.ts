import React from 'react';
interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
}
interface GlassNavbarProps {
    items?: NavItem[];
    logo?: string;
    logoText?: string;
    className?: string;
    onItemClick?: (item: NavItem) => void;
}
declare const GlassNavbar: React.FC<GlassNavbarProps>;
export declare const GlassCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}>;
export declare const GlassButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
}>;
export default GlassNavbar;
