import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RateModal from '@/lib/Modal';

const CurrencyPairAnalysis = () => {
  const { pairs } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highestRates, setHighestRates] = useState([]);
  const [lowestRates, setLowestRates] = useState([]);
  const [highestRateVendors, setHighestRateVendors] = useState([]);
  const [lowestRateVendors, setLowestRateVendors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const pair = splitCurrencyPair(pairs);

  function splitCurrencyPair(pair) {
    const [baseCurrency, quoteCurrency] = pair.split('-');
    return `${baseCurrency}/${quoteCurrency}`;
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://xchangerate-banf.onrender.com/api/rates/dbrates/pairs?pair=${pair}`);
      const data = response.data.data[0];

      const historicalRates = data.map(entry => ({
        id: entry.id,
        date: new Date(entry.createdAt).toLocaleDateString(),
        rate: parseFloat(entry.rates['Wise Exchange']).toFixed(2),
        vendors: Object.keys(entry.rates)
          .filter(vendor => vendor !== 'undefined' && entry.rates[vendor] !== null)
          .map(vendor => ({
            name: vendor,
            rate: parseFloat(entry.rates[vendor]).toFixed(2)
          }))
      }));

      setHistoryData(historicalRates);
      const latestRate = historicalRates[historicalRates.length - 1].rate;
      setCurrentRate(latestRate);

      const predictedRate = (parseFloat(latestRate) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2);
      setPrediction(predictedRate);

      const allRates = historicalRates.flatMap(entry => entry.vendors.map(vendor => parseFloat(vendor.rate)));
      const highestRates = allRates.sort((a, b) => b - a).slice(0, 3);
      const lowestRates = allRates.sort((a, b) => a - b).slice(0, 3);

      const highestRateVendors = historicalRates.flatMap(entry => entry.vendors.filter(vendor => highestRates.includes(parseFloat(vendor.rate))));
      const lowestRateVendors = historicalRates.flatMap(entry => entry.vendors.filter(vendor => lowestRates.includes(parseFloat(vendor.rate))));

      setHighestRates(highestRates);
      setLowestRates(lowestRates);
      setHighestRateVendors(highestRateVendors);
      setLowestRateVendors(lowestRateVendors);
    } catch (err) {
      setError("Failed to fetch rates.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [pair]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <Button onClick={() => navigate(-1)} className="mb-5">Go Back</Button>
      <h1 className="text-3xl font-bold mb-5">Analysis for {pair}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Current Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{currentRate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prediction (Next 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{prediction}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Historical Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 0.05', 'dataMax + 0.05']} tickFormatter={(value) => value.toFixed(2)} />
              <Tooltip formatter={(value) => value.toFixed(2)} />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button onClick={() => setModalOpen(true)} className="mb-5">View Rate Analysis</Button>

      <RateModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        highestRates={highestRates}
        lowestRates={lowestRates}
        highestRateVendors={highestRateVendors}
        lowestRateVendors={lowestRateVendors}
      />
    </div>
  );
};

export default CurrencyPairAnalysis;