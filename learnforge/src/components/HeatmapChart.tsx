import React, { useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';

interface Props {
  weeks?: number; // default 12
}

const LEVELS = [
  { min: 0,   max: 0,   bg: 'bg-gray-100',   label: '0 min' },
  { min: 1,   max: 30,  bg: 'bg-green-200',  label: '1-30 min' },
  { min: 31,  max: 60,  bg: 'bg-green-400',  label: '31-60 min' },
  { min: 61,  max: 120, bg: 'bg-green-600',  label: '61-120 min' },
  { min: 121, max: Infinity, bg: 'bg-green-800', label: '120+ min' },
];

function getLevel(minutes: number) {
  return LEVELS.find(l => minutes >= l.min && minutes <= l.max) ?? LEVELS[0];
}

function toYMD(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatDateLabel(ymd: string) {
  const d = new Date(ymd + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HeatmapChart: React.FC<Props> = ({ weeks = 12 }) => {
  const { progress } = useProgressStore();

  // Build a map: "YYYY-MM-DD" -> total minutes
  const minutesPerDay = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const log of progress.sessionLogs) {
      const ymd = log.date.split('T')[0];
      map[ymd] = (map[ymd] ?? 0) + log.minutesSpent;
    }
    return map;
  }, [progress.sessionLogs]);

  // Build grid: weeks × 7 days, newest week on the right
  const today = new Date();
  // Align to end of current week (Sunday)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  // We want Monday-based grid. Shift so Monday=0
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const grid: { ymd: string; minutes: number }[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekCells: { ymd: string; minutes: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const daysBack = w * 7 + (6 - d) + mondayOffset;
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - daysBack);
      const ymd = toYMD(cellDate);
      weekCells.push({ ymd, minutes: minutesPerDay[ymd] ?? 0 });
    }
    grid.push(weekCells);
  }

  // Month labels: figure out which weeks start a new month
  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  grid.forEach((week, colIdx) => {
    const d = new Date(week[0].ymd + 'T00:00:00');
    const month = d.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        colIndex: colIdx,
      });
      lastMonth = month;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Study Activity</h3>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2 mt-5">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-[14px] text-[10px] text-gray-400 dark:text-gray-500 leading-[14px] text-right pr-1"
              style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 ml-0" style={{ height: '16px' }}>
            {grid.map((_, colIdx) => {
              const label = monthLabels.find(m => m.colIndex === colIdx);
              return (
                <div
                  key={colIdx}
                  className="w-[14px] text-[10px] text-gray-400 dark:text-gray-500 text-center leading-[16px] overflow-visible"
                >
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Cells */}
          <div className="flex gap-[3px]">
            {grid.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[3px]">
                {week.map((cell) => {
                  const level = getLevel(cell.minutes);
                  const isFuture = cell.ymd > toYMD(today);
                  return (
                    <div
                      key={cell.ymd}
                      title={`${formatDateLabel(cell.ymd)} — ${cell.minutes > 0 ? cell.minutes + ' min studied' : 'No activity'}`}
                      className={`w-[14px] h-[14px] rounded-[3px] cursor-default transition-opacity ${isFuture ? 'opacity-0' : level.bg}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 ml-8">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Less</span>
        {LEVELS.map((l) => (
          <div key={l.label} title={l.label} className={`w-[14px] h-[14px] rounded-[3px] ${l.bg}`} />
        ))}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
};
