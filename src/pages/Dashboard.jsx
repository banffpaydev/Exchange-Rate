import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getRates } from '@/utils/api';

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];

const CurrencyCard = ({ pair, rate, change, chartData, onClick }) => {
  const isPositive = change >= 0;
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold">{pair}</h3>
            <p className="text-2xl">{parseFloat(rate).toFixed(4)}</p>
          </div>
          <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
        <div className="h-[60px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#22c55e" : "#ef4444"} 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchRates = async () => {
      try {
        const response = await getRates();
        setRates(response.data);
      } catch (error) {
        console.error("Failed to fetch rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [navigate]);

  const handleCardClick = (pair) => {
    navigate(`/currency-pair/${pair.replace('/', '-')}`);
  };

  const generateMockChartData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      value: 50 + Math.random() * 50
    }));
  };

  const calculateChange = (rate) => {
    // Mock change percentage between -5 and 5
    return (Math.random() * 10 - 5);
  };

  const visiblePairs = currencyPairs.slice(
    currentPage * cardsPerPage,
    (currentPage * cardsPerPage) + cardsPerPage
  );

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Forex Market Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {visiblePairs.map((pair) => (
          <CurrencyCard
            key={pair}
            pair={pair}
            rate={rates[pair]?.['Wise Exchange'] || 0}
            change={calculateChange(rates[pair]?.['Wise Exchange'])}
            chartData={generateMockChartData()}
            onClick={() => handleCardClick(pair)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(Math.ceil(currencyPairs.length / cardsPerPage) - 1, p + 1))}
          disabled={currentPage >= Math.ceil(currencyPairs.length / cardsPerPage) - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;