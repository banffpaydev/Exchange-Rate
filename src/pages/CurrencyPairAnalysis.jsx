import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CurrencyPairAnalysis = () => {
  const { pairs } = useParams(); // Extract pair from URL params
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pair = splitCurrencyPair(pairs);

  function splitCurrencyPair(pair) {
    const [baseCurrency, quoteCurrency] = pair.split('-');
    return `${baseCurrency}/${quoteCurrency}`;
  }

  // Function to fetch data from the API
  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/rates/dbrates/pairs?pair=${pair}`);
      const data = response.data.data[0];
      const rates = data.rates;

      // Prepare the historical data (using 'createdAt' as date)
      const historicalRates = Object.entries(rates)
        .filter(([vendor, rate]) => vendor !== "undefined" && rate !== null)
        .map(([vendor, rate], index) => ({
          date: `2024-10-${index + 1}` , // Mocking date for simplicity, assuming index for day
          rate: parseFloat(rate).toFixed(4)
        }));

      setHistoryData(historicalRates);

      // Set the current rate as the latest in the historical data
      const latestRate = historicalRates[historicalRates.length - 1].rate;
      setCurrentRate(latestRate);

      // Simple prediction logic (random fluctuation for demonstration purposes)
      const predictedRate = (parseFloat(latestRate) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(4);
      setPrediction(predictedRate);
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
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            <li>Currency Pair: {pair}</li>
            <li>Volatility: {(Math.random() * 5).toFixed(2)}%</li>
            <li>24h Change: {((Math.random() - 0.5) * 2).toFixed(2)}%</li>
            <li>7d Change: {((Math.random() - 0.5) * 5).toFixed(2)}%</li>
            <li>30d Change: {((Math.random() - 0.5) * 10).toFixed(2)}%</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyPairAnalysis;
