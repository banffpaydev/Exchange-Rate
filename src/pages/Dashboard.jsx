import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { getRates } from '@/utils/api';
import { ScrollingRates } from '@/components/dashboard/ScrollingRates';
import { CurrencyAnalysis } from '@/components/dashboard/CurrencyAnalysis';

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const response = await getRates();
      setRates(response.data);
      setLastUpdateTime(new Date().toLocaleTimeString());
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
      <ScrollingRates rates={rates} lastUpdateTime={lastUpdateTime} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        {currencyPairs.map(pair => (
          <CurrencyAnalysis key={pair} pair={pair} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;