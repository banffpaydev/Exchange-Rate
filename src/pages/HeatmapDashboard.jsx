import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { getRates } from '@/utils/api';

const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'CNY'];

const HeatmapDashboard = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
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

  const getPercentageChange = (baseCurrency, quoteCurrency) => {
    if (!rates[`${baseCurrency}/${quoteCurrency}`]) return null;
    // Mock percentage change between -0.5% and 0.5%
    return (Math.random() - 0.5).toFixed(2);
  };

  const getCellColor = (value) => {
    if (value === null) return 'bg-gray-100';
    const numValue = parseFloat(value);
    if (numValue > 0) return 'bg-green-100 hover:bg-green-200';
    if (numValue < 0) return 'bg-red-100 hover:bg-red-200';
    return 'bg-gray-50 hover:bg-gray-100';
  };

  const handleCellClick = (baseCurrency, quoteCurrency) => {
    navigate(`/currency-pair/${baseCurrency}-${quoteCurrency}`);
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Currency Heatmap</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 border bg-gray-50"></th>
              {currencies.map(currency => (
                <th key={currency} className="p-3 border bg-gray-50 font-semibold">
                  {currency}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currencies.map(baseCurrency => (
              <tr key={baseCurrency}>
                <th className="p-3 border bg-gray-50 font-semibold">
                  {baseCurrency}
                </th>
                {currencies.map(quoteCurrency => {
                  const change = getPercentageChange(baseCurrency, quoteCurrency);
                  return (
                    <td
                      key={quoteCurrency}
                      className={`p-3 border cursor-pointer transition-colors ${getCellColor(change)}`}
                      onClick={() => handleCellClick(baseCurrency, quoteCurrency)}
                    >
                      {baseCurrency === quoteCurrency ? (
                        '-'
                      ) : (
                        <div className="text-center">
                          {change !== null ? `${change}%` : 'N/A'}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeatmapDashboard;