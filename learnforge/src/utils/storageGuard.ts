export function getStorageUsagePercent(): number {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      totalBytes += (key.length + value.length) * 2; // UTF-16 characters use 2 bytes
    }
  }
  const maxBytes = 5 * 1024 * 1024; // 5MB standard limit
  return (totalBytes / maxBytes) * 100;
}

export function checkAndWarn(): 'ok' | 'warning' | 'critical' {
  const percent = getStorageUsagePercent();
  if (percent > 95) return 'critical';
  if (percent > 80) return 'warning';
  return 'ok';
}

export function pruneOldSessionLogs(): void {
  const status = checkAndWarn();
  if (status === 'critical') {
    const progressRaw = localStorage.getItem('learnforge:progress');
    if (progressRaw) {
      try {
        const progress = JSON.parse(progressRaw);
        if (progress && Array.isArray(progress.sessionLogs)) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          progress.sessionLogs = progress.sessionLogs.filter((log: any) => {
            return new Date(log.date) >= thirtyDaysAgo;
          });
          
          // Call localStorage.setItem directly to avoid circular dependency with safeSet
          try {
            localStorage.setItem('learnforge:progress', JSON.stringify(progress));
          } catch (e) {
            console.error("Error saving pruned session logs", e);
          }
        }
      } catch (e) {
        console.error("Error pruning old session logs", e);
      }
    }
  }
}

export function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('LocalStorage quota exceeded');
      pruneOldSessionLogs(); // Try to free space
      // Try one more time after prune
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        return false;
      }
    }
    return false;
  }
}
