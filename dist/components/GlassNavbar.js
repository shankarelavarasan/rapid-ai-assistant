import React, { useState, useEffect } from 'react';
import { Menu, X, Home, FileText, BarChart3, Settings, User, Search, Bell } from 'lucide-react';
const defaultNavItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5"/>, href: '/' },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5"/>, href: '/documents' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5"/>, href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5"/>, href: '/settings' },
];
const GlassNavbar = ({ items = defaultNavItems, logo, logoText = 'Rapid AI', className = '', onItemClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(items[0]?.id || '');
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const handleItemClick = (item) => {
        setActiveItem(item.id);
        setIsOpen(false);
        onItemClick?.(item);
    };
    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (!showSearch) {
            setTimeout(() => {
                document.getElementById('search-input')?.focus();
            }, 100);
        }
    };
    return (<>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg'
            : 'backdrop-blur-md bg-white/5'} ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {logo ? (<img src={logo} alt={logoText} className="h-8 w-8 rounded-lg"/>) : (<div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>)}
              <span className="text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {logoText}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {items.map((item) => (<button key={item.id} onClick={() => handleItemClick(item)} className={`relative px-4 py-2 rounded-xl transition-all duration-300 group ${activeItem === item.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <div className="flex items-center space-x-2">
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>)}
                  </div>
                  
                  {/* Active indicator */}
                  {activeItem === item.id && (<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"/>)}
                </button>))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                {showSearch ? (<div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                    <Search className="w-4 h-4 text-white/60"/>
                    <input id="search-input" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent text-white placeholder-white/60 outline-none w-32 sm:w-48" onBlur={() => {
                if (!searchQuery) {
                    setShowSearch(false);
                }
            }}/>
                    {searchQuery && (<button onClick={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                }} className="text-white/60 hover:text-white transition-colors">
                        <X className="w-4 h-4"/>
                      </button>)}
                  </div>) : (<button onClick={toggleSearch} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110">
                    <Search className="w-5 h-5"/>
                  </button>)}
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110">
                <Bell className="w-5 h-5"/>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {/* Profile */}
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110">
                <User className="w-5 h-5"/>
              </button>

              {/* Mobile menu button */}
              <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300">
                {isOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-2 bg-white/5 backdrop-blur-xl border-t border-white/10">
            {items.map((item) => (<button key={item.id} onClick={() => handleItemClick(item)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeItem === item.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                <span className="transition-transform duration-300 hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (<span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>)}
              </button>))}
          </div>
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      {isOpen && (<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)}/>)}
    </>);
};
// Glass Card Component for consistent styling
export const GlassCard = ({ children, className = '', hover = true }) => {
    return (<div className={`
      backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl
      ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-2xl transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>);
};
// Glass Button Component
export const GlassButton = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-white hover:from-purple-500/30 hover:to-pink-500/30',
        secondary: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
        danger: 'bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30'
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    return (<button onClick={onClick} disabled={disabled} className={`
        backdrop-blur-xl border rounded-xl transition-all duration-300
        hover:scale-105 hover:shadow-lg active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}>
      {children}
    </button>);
};
export default GlassNavbar;
//# sourceMappingURL=GlassNavbar.js.map