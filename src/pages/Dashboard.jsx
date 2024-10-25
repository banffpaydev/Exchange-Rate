import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRates } from '@/utils/api';

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];

// Generate random colors for each currency pair
const colors = {
  'USD/NGN': '#8884d8',
  'EUR/NGN': '#82ca9d',
  'GBP/NGN': '#ffc658',
  'CAD/NGN': '#ff7300',
  'CNY/NGN': '#00C49F',
  'USD/LRD': '#FFBB28',
  'EUR/LRD': '#FF8042',
  'GBP/LRD': '#0088FE',
  'CAD/LRD': '#FF99E6',
  'CNY/LRD': '#4B0082'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPairs, setSelectedPairs] = useState(
    currencyPairs.reduce((acc, pair) => ({ ...acc, [pair]: true }), {})
  );

  const fetchRates = async () => {
    try {
      const response = await getRates();
      setRates(response.data);
      
      // Add new data point to historical data
      const newDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        ...Object.keys(response.data).reduce((acc, pair) => ({
          ...acc,
          [pair]: response.data[pair]?.['Wise Exchange'] || 0
        }), {})
      };

      setHistoricalData(prevData => {
        const newData = [...prevData, newDataPoint];
        // Keep only last 50 data points to prevent excessive memory usage
        return newData.slice(-50);
      });
    } catch (error) {
      toast.error("Failed to fetch rates");
      console.error("Failed to fetch rates:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initial fetch
    fetchRates();

    // Set up interval for updates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const togglePair = (pair) => {
    setSelectedPairs(prev => ({
      ...prev,
      [pair]: !prev[pair]
    }));
  };

  if (loading && historicalData.length === 0) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Live Currency Exchange Rates</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
        {currencyPairs.map((pair) => (
          <div key={pair} className="flex items-center space-x-2">
            <Checkbox
              id={pair}
              checked={selectedPairs[pair]}
              onCheckedChange={() => togglePair(pair)}
            />
            <label
              htmlFor={pair}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              style={{ color: colors[pair] }}
            >
              {pair}
            </label>
          </div>
        ))}
      </div>

      <Card className="p-4">
        <CardContent>
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  label={{ value: 'Time', position: 'bottom' }}
                />
                <YAxis label={{ value: 'Exchange Rate', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {currencyPairs.map((pair) => (
                  selectedPairs[pair] && (
                    <Line
                      key={pair}
                      type="monotone"
                      dataKey={pair}
                      stroke={colors[pair]}
                      name={pair}
                      dot={false}
                      strokeWidth={2}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
