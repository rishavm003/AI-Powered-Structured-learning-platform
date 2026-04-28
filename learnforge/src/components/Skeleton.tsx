import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  rounded = 'rounded-md',
  className = '',
}) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${rounded} ${className}`}
    style={{ width, height }}
    role="status"
    aria-label="Loading…"
  />
);

/** A skeleton mimicking a RoadmapCard */
export const RoadmapCardSkeleton: React.FC = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
    <div className="flex justify-between">
      <Skeleton width="40%" height="18px" />
      <Skeleton width="14%" height="18px" rounded="rounded-full" />
    </div>
    <Skeleton width="75%" height="14px" />
    <Skeleton width="100%" height="6px" rounded="rounded-full" />
    <Skeleton width="30%" height="12px" />
  </div>
);

/** A skeleton mimicking a subtopic row */
export const SubtopicRowSkeleton: React.FC = () => (
  <div className="flex items-start space-x-4 p-3">
    <Skeleton width="20px" height="20px" rounded="rounded" />
    <div className="flex-1 space-y-2">
      <Skeleton width="50%" height="14px" />
      <Skeleton width="90%" height="12px" />
    </div>
    <Skeleton width="60px" height="22px" rounded="rounded-full" />
  </div>
);

/** A skeleton mimicking an assistant chat bubble */
export const ChatBubbleSkeleton: React.FC = () => (
  <div className="flex justify-start">
    <div className="max-w-[85%] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl rounded-bl-none px-4 py-3 space-y-2 w-64">
      <Skeleton width="90%" height="12px" />
      <Skeleton width="70%" height="12px" />
      <Skeleton width="80%" height="12px" />
    </div>
  </div>
);
