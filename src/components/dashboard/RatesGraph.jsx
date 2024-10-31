import React from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatPair } from '@/utils/currencySymbols';

const colors = {
  'USD/NGN': '#00897B', 'EUR/NGN': '#4CAF50', 'GBP/NGN': '#2196F3',
  'CAD/NGN': '#9C27B0', 'CNY/NGN': '#FF9800', 'USD/LRD': '#F44336',
  'EUR/LRD': '#3F51B5', 'GBP/LRD': '#009688', 'CAD/LRD': '#FF5722',
  'CNY/LRD': '#795548'
};

const RatesGraph = ({ historicalData, currencyPairs }) => {
  return (
    <Card className="mt-4 p-2">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            {currencyPairs.map(pair => (
              <Line
                key={pair}
                type="monotone"
                dataKey={pair}
                stroke={colors[pair]}
                name={formatPair(pair)}
                dot={false}
                strokeWidth={1}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RatesGraph;