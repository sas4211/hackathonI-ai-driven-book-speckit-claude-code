import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Code, Brain, Database, TrendingUp } from 'lucide-react';
import BookNavigation from './BookNavigation';

/**
 * ResponsiveLayout - A comprehensive responsive layout for the ML Interactive Book
 * Provides mobile-first design with progressive enhancement for tablet and desktop
 */

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  sidebar: boolean;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900">AI/ML Book</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full overflow-y-auto">
          <BookNavigation />
        </div>
      </div>
    </div>
  );
};

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  sidebar,
  mobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Main content container
  const MainContent = () => (
    <main
      className={`${sidebar && isDesktop ? 'ml-64' : ''} transition-all duration-300`}
      style={{ minHeight: '100vh' }}
    >
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{title || 'AI/ML Interactive Book'}</h1>
            </div>
          </div>
        </div>

        {/* Mobile Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t">
            <nav className="flex space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-500">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Content Wrapper */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && isDesktop && (
          <nav className="mb-4">
            <ol className="flex space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-500">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Main Content Area */}
        <div className="prose max-w-none lg:prose-lg">
          {children}
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {sidebar && isDesktop && (
        <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-gray-900">AI/ML Interactive Book</span>
            </div>
            {title && (
              <div className="text-sm text-gray-600 mb-2">{title}</div>
            )}
          </div>
          <BookNavigation />
        </aside>
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={onMobileMenuToggle} />

      {/* Main Content */}
      <MainContent />

      {/* Mobile Footer Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5">
          <button className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Learn</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600">
            <Code className="w-5 h-5" />
            <span className="text-xs">Code</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600">
            <Brain className="w-5 h-5" />
            <span className="text-xs">Play</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600">
            <Database className="w-5 h-5" />
            <span className="text-xs">Data</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Progress</span>
          </button>
        </div>
      </nav>

      {/* Debug Info (Mobile) */}
      <div className="lg:hidden text-xs text-gray-500 p-2 text-center">
        Mobile optimized • Desktop view available on larger screens
      </div>
    </div>
  );
};

// Responsive helper components
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}> = ({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 'gap-4', className = '' }) => {
  const colClasses = Object.entries(cols)
    .map(([size, count]) => `${size}:grid-cols-${count}`)
    .join(' ');

  return (
    <div className={`grid ${gap} ${colClasses} ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: {
    sm?: string;
    md?: string;
  };
}> = ({ children, className = '', padding = { sm: 'p-4', md: 'p-6' } }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveTypography: React.FC<{
  children: React.ReactNode;
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
  align?: 'center' | 'left' | 'right';
  color?: string;
}> = ({ children, variant = 'body', align = 'left', color = 'text-gray-900' }) => {
  const classes = {
    heading: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    subheading: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base lg:text-lg',
    caption: 'text-xs sm:text-sm text-gray-600',
  }[variant];

  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return <div className={`${classes} ${alignment} ${color}`}>{children}</div>;
};

export default ResponsiveLayout;