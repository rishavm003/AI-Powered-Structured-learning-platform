import React, { useEffect, useState } from 'react';
import { checkAndWarn } from '../utils/storageGuard';

export const StorageWarning: React.FC = () => {
  const [warningLevel, setWarningLevel] = useState<'ok' | 'warning' | 'critical'>('ok');

  useEffect(() => {
    const status = checkAndWarn();
    setWarningLevel(status);
  }, []);

  if (warningLevel === 'ok') return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg max-w-sm ${warningLevel === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
      <h3 className="font-bold">Storage Warning</h3>
      <p className="text-sm">
        {warningLevel === 'critical' 
          ? "Local storage is almost full. Older session logs will be pruned."
          : "Local storage is over 80% capacity. Consider clearing some data soon."}
      </p>
    </div>
  );
};
