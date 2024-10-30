import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';
import { basisUrl } from '@/utils/api';
import { toast } from 'sonner';

export const CurrencyAnalysis = ({ pair }) => {
  const [analysis, setAnalysis] = useState(null);

  const fetchAnalysis = async () => {
    try {
      const currentDateTime = new Date().toISOString();
      const response = await axios.get(`${basisUrl}/api/rates/getrates`, {
        params: {
          currency: pair,
          startDate: currentDateTime.split('T')[0],
          endDate: currentDateTime,
        }
      });
      if (response.data) {
        setAnalysis(response.data);
      }
    } catch (error) {
      toast.error(`Failed to fetch analysis for ${pair}`);
    }
  };

  React.useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [pair]);

  if (!analysis) return null;

  return (
    <Card className="p-2">
      <CardContent className="p-2 text-xs">
        <h4 className="font-bold mb-2 text-sm">{pair} Analysis</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="font-semibold">Avg: {analysis.Avgrate.toFixed(2)}</div>
            <div>Low: {Math.min(...analysis.lows).toFixed(2)}</div>
          </div>
          <div>
            <div>High: {Math.max(...analysis.highs).toFixed(2)}</div>
            <div>Trend: {analysis.Avgrate > Math.min(...analysis.lows) ? '↑' : '↓'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};