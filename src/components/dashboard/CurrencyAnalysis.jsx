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

  const trendColor = analysis.Avgrate > Math.min(...analysis.lows) ? 'text-green-500' : 'text-red-500';
  const trendIcon = analysis.Avgrate > Math.min(...analysis.lows) ? '↑' : '↓';
  
  // Sort rates for top and bottom 5
  const sortedRates = [...analysis.highs, ...analysis.lows].sort((a, b) => b - a);
  const top5 = sortedRates.slice(0, 5);
  const bottom5 = sortedRates.slice(-5).reverse();

  return (
    <HoverCard>
      <HoverCardTrigger>
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
                <div className={`font-bold ${trendColor}`}>
                  Trend: {trendIcon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-bold text-lg">{pair} Detailed Analysis</h4>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="font-semibold">Average Rate</div>
                <div>{analysis.Avgrate.toFixed(4)}</div>
              </div>
              <div>
                <div className="font-semibold">Trend</div>
                <div className={trendColor}>
                  {trendIcon} {analysis.Avgrate > Math.min(...analysis.lows) ? 'Upward' : 'Downward'}
                </div>
              </div>
            </div>
            
            <div>
              <div className="font-semibold">Top 5 Rates</div>
              <div className="grid grid-cols-5 gap-1">
                {top5.map((rate, idx) => (
                  <div key={idx} className="text-green-600 text-xs">{rate.toFixed(2)}</div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="font-semibold">Bottom 5 Rates</div>
              <div className="grid grid-cols-5 gap-1">
                {bottom5.map((rate, idx) => (
                  <div key={idx} className="text-red-600 text-xs">{rate.toFixed(2)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};