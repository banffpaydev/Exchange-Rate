import React, { useState } from 'react';
import { formatPair, currencySymbols } from '@/utils/currencySymbols';

const getCountryFlag = (currency) => {
  const countryCode = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb',
    'CAD': 'ca', 'CNY': 'cn', 'NGN': 'ng',
    'LRD': 'lr', 'AED': 'ae', 'GHS': 'gh',
    'SLL': 'sl', 'RWF': 'rw'
  }[currency];
  

  return countryCode ? 
    `https://flagcdn.com/16x12/${countryCode}.png` : 
    null;
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
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
            <div key={`${pair}-${index}`} className="flex items-center px-4">
              <span className="text-xs text-gray-500">@{lastUpdateTime}</span>
              <span className="flex items-center font-bold ml-2">
                {baseFlag && <img src={baseFlag} alt={baseCurrency} className="inline h-3 w-4 mr-1" />}
                {currencySymbols[baseCurrency]}/
                {quoteFlag && <img src={quoteFlag} alt={quoteCurrency} className="inline h-3 w-4 mx-1" />}
                {currencySymbols[quoteCurrency]}:
                <span className="ml-2">
                {formatNumber(data?.['Wise Exchange'] || 0)}
              </span>
              </span>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};