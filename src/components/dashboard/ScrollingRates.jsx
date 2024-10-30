import React, { useState } from 'react';
import { formatPair } from '@/utils/currencySymbols';

export const ScrollingRates = ({ rates }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div 
      className="w-full overflow-hidden bg-gray-100 py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`whitespace-nowrap flex gap-4 ${isPaused ? '' : 'animate-marquee'}`}>
        {Object.entries(rates).map(([pair, data]) => (
          <div key={pair} className="inline-block px-4">
            <span className="font-bold">{formatPair(pair)}:</span>
            <span className="ml-2">{data?.['Wise Exchange']?.toFixed(2) || 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};