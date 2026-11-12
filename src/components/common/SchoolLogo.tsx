import React from 'react';
import { SCHOOL_LOGO, SCHOOL_NAME } from '../../constants/school';
import { useSchool } from '../../context/SchoolContext';

interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  rounded?: string;
  alt?: string;
  src?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  rounded = 'rounded-full',
  alt,
  src,
}) => {
  let contextLogo = SCHOOL_LOGO;
  let contextName = SCHOOL_NAME;

  try {
    const school = useSchool();
    if (school?.schoolSettings?.logo) {
      contextLogo = school.schoolSettings.logo;
    }
    if (school?.schoolSettings?.schoolName) {
      contextName = school.schoolSettings.schoolName;
    }
  } catch {
    // If rendered outside provider
  }

  const finalSrc = src || contextLogo;
  const finalAlt = alt || `${contextName} Logo`;

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
    custom: '',
  };

  return (
    <img
      src={finalSrc}
      alt={finalAlt}
      className={`object-contain bg-white shrink-0 ${sizeClasses[size] || ''} ${rounded} ${className}`}
    />
  );
};
