import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { CSVLink } from "react-csv";

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];

const CurrencyPairAnalysis = () => {
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState(currencyPairs[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [historyData, setHistoryData] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRates();
  }, [selectedPair, startDate, endDate]);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace this with your actual API call
      const response = await axios.get(`https://api.example.com/rates?pair=${selectedPair}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      const data = response.data;
      
      setHistoryData(data.history);
      setCurrentRate(data.currentRate);
      setPrediction(data.prediction);
    } catch (err) {
      setError("Failed to fetch rates.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <Button onClick={() => navigate(-1)} className="mb-5">Go Back</Button>
      <h1 className="text-3xl font-bold mb-5">Currency Pair Analysis</h1>
      
      <div className="flex space-x-4 mb-5">
        <Select onValueChange={setSelectedPair} value={selectedPair}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select currency pair" />
          </SelectTrigger>
          <SelectContent>
            {currencyPairs.map((pair) => (
              <SelectItem key={pair} value={pair}>{pair}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker
          date={startDate}
          onDateChange={setStartDate}
          className="w-[180px]"
        />
        <DatePicker
          date={endDate}
          onDateChange={setEndDate}
          className="w-[180px]"
        />
        <CSVLink
          data={historyData}
          filename={`${selectedPair}_rates.csv`}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Download CSV
        </CSVLink>
      </div>
      
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

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            <li>Currency Pair: {selectedPair}</li>
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