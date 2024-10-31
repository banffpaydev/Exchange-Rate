import React, { useState } from 'react';
import { formatPair } from '@/utils/currencySymbols';

const getCountryFlag = (currency) => {
  const countryCode = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb',
    'CAD': 'ca', 'CNY': 'cn', 'NGN': 'ng',
    'LRD': 'lr'
  }[currency];
  
  return countryCode ? 
    `https://flagcdn.com/24x18/${countryCode}.png` : 
    null;
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

export const ScrollingRates = ({ rates, lastUpdateTime }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div 
      className="w-full overflow-hidden bg-gray-100 py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`flex whitespace-nowrap ${
          isPaused ? '' : 'animate-[marquee_30s_linear_infinite]'
        }`}
        style={{ gap: '0' }}
      >
        {[...Object.entries(rates), ...Object.entries(rates)].map(([pair, data], index) => {
          const [baseCurrency, quoteCurrency] = pair.split('/');
          const baseFlag = getCountryFlag(baseCurrency);
          const quoteFlag = getCountryFlag(quoteCurrency);
          
          return (
            <div key={`${pair}-${index}`} className="inline-flex items-center px-4">
              <span className="text-xs text-gray-500">@{lastUpdateTime}</span>
              <span className="font-bold ml-2">
                {baseFlag && <img src={baseFlag} alt={baseCurrency} className="inline h-4 w-5 mr-1" />}
                {baseCurrency}/
                {quoteFlag && <img src={quoteFlag} alt={quoteCurrency} className="inline h-4 w-5 mx-1" />}
                {quoteCurrency}:
              </span>
              <span className="ml-2">
                {formatNumber(data?.['Wise Exchange'] || 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};