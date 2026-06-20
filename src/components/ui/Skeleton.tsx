import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={`shimmer-bg rounded-md ${className || ''}`}
      {...props}
    />
  );
};

export default Skeleton;
