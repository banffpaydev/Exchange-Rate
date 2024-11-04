import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { getRates } from '@/utils/api';
import { ScrollingRates } from '@/components/dashboard/ScrollingRates';
import { CurrencyAnalysis } from '@/components/dashboard/CurrencyAnalysis';


const ngnPairs = ['USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN',
  'GHS/NGN', 'CNY/NGN', 'AED/NGN', 'SLL/NGN', 'RWF/NGN'];
const lrdPairs = ['USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD',
  'GHS/LRD', 'CNY/LRD', 'AED/LRD', 'SLL/LRD', 'RWF/LRD'];

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
      
      <div className="grid grid-cols-1 gap-6 mt-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">NGN Exchange Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ngnPairs.map(pair => (
              <CurrencyAnalysis key={pair} pair={pair} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">LRD Exchange Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lrdPairs.map(pair => (
              <CurrencyAnalysis key={pair} pair={pair} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;