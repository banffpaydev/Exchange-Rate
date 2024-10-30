import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRates } from '@/utils/api';
import { ScrollingRates } from '@/components/dashboard/ScrollingRates';
import { CurrencyAnalysis } from '@/components/dashboard/CurrencyAnalysis';
import { formatPair } from '@/utils/currencySymbols';

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];

const colors = {
  'USD/NGN': '#00897B', 'EUR/NGN': '#4CAF50', 'GBP/NGN': '#2196F3',
  'CAD/NGN': '#9C27B0', 'CNY/NGN': '#FF9800', 'USD/LRD': '#F44336',
  'EUR/LRD': '#3F51B5', 'GBP/LRD': '#009688', 'CAD/LRD': '#FF5722',
  'CNY/LRD': '#795548'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const response = await getRates();
      setRates(response.data);
      
      const newDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        ...Object.keys(response.data).reduce((acc, pair) => ({
          ...acc,
          [pair]: response.data[pair]?.['Wise Exchange'] || 0
        }), {})
      };

      setHistoricalData(prevData => {
        const newData = [...prevData, newDataPoint];
        return newData.slice(-20);
      });

      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch rates");
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-4 px-2">
      <ScrollingRates rates={rates} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        {currencyPairs.map(pair => (
          <CurrencyAnalysis key={pair} pair={pair} />
        ))}
      </div>
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
    </div>
  );
};

export default Dashboard;
