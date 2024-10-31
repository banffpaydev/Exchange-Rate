import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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

  const percentageChange = ((analysis.Avgrate - Math.min(...analysis.lows)) / Math.min(...analysis.lows) * 100).toFixed(2);
  const trendColor = percentageChange > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Card className="p-2">
          <CardContent className="p-2 text-xs">
            <h4 className="font-bold mb-2 text-sm">{pair}</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="font-semibold">Avg: {analysis.Avgrate.toFixed(2)}</div>
                <div>Low: {Math.min(...analysis.lows).toFixed(2)}</div>
              </div>
              <div>
                <div>High: {Math.max(...analysis.highs).toFixed(2)}</div>
                <div className={`font-bold ${trendColor}`}>
                  {percentageChange}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="font-bold mb-2">Rate Analysis</h5>
            <div className="space-y-1 text-sm">
              <div>Average: {analysis.Avgrate.toFixed(4)}</div>
              <div>Low Avg: {analysis.lowAvg.toFixed(4)}</div>
              <div>High Avg: {analysis.highAvg.toFixed(4)}</div>
              <div className={trendColor}>Change: {percentageChange}%</div>
            </div>
          </div>
          <div>
            <h5 className="font-bold mb-2">Historical Data</h5>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-green-600">Top 5:</div>
                <div className="grid grid-cols-5 gap-1">
                  {analysis.highs.slice(0, 5).map((rate, idx) => (
                    <div key={idx}>{rate.toFixed(2)}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-red-600">Bottom 5:</div>
                <div className="grid grid-cols-5 gap-1">
                  {analysis.lows.slice(0, 5).map((rate, idx) => (
                    <div key={idx}>{rate.toFixed(2)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};