import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CurrencyPairAnalysis = () => {
  const { pair } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app, you'd fetch this data from an API
  const historyData = Array.from({ length: 30 }, (_, i) => ({
    date: `2023-${(i + 1).toString().padStart(2, '0')}-01`,
    rate: (Math.random() * (1.5 - 0.5) + 0.5).toFixed(4)
  }));

  const prediction = (parseFloat(historyData[historyData.length - 1].rate) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(4);

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
            <p className="text-4xl font-bold">{historyData[historyData.length - 1].rate}</p>
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