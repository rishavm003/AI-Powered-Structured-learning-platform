import React from 'react';
import type { Day } from '../types';

interface Props {
  day: Day;
}

export const DayCard: React.FC<Props> = ({ day }) => {
  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <h3 className="font-bold text-lg mb-2">{day.title}</h3>
      <ul className="list-disc pl-5">
        {day.goals.map((goal, idx) => (
          <li key={idx} className="text-sm text-gray-700">{goal}</li>
        ))}
      </ul>
    </div>
  );
};
