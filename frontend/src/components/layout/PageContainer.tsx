import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-20 pb-12 min-h-screen ${className}`}>
      {children}
    </main>
  );
}
