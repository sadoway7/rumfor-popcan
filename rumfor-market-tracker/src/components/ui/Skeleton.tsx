import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animationDelay?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animationDelay = 0,
}) => {
  const baseStyles = 'relative overflow-hidden bg-surface-2 animate-skeleton-fade';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
    animationDelay: `${animationDelay}ms`,
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
  variant?: 'market' | 'vendor';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  variant = 'market',
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white border border-surface-3',
        variant === 'market' && 'h-[384px]',
        variant === 'vendor' && 'h-[128px]',
        className
      )}
    >
    </div>
  );
};
