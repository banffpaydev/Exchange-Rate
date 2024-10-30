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

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Card className="p-1 hover:shadow-lg transition-shadow">
          <CardContent className="p-1 text-xs">
            <h4 className="font-bold mb-1">{pair}</h4>
            <div className="grid grid-cols-2 gap-1">
              <div className="font-semibold">Avg: {analysis.Avgrate.toFixed(2)}</div>
              <div>Trend: {analysis.Avgrate > Math.min(...analysis.lows) ? '↑' : '↓'}</div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-bold text-lg">{pair} Detailed Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold">Average Rate</div>
              <div>{analysis.Avgrate.toFixed(4)}</div>
            </div>
            <div>
              <div className="font-semibold">Trend</div>
              <div className={analysis.Avgrate > Math.min(...analysis.lows) ? 'text-green-500' : 'text-red-500'}>
                {analysis.Avgrate > Math.min(...analysis.lows) ? '↑ Upward' : '↓ Downward'}
              </div>
            </div>
            <div>
              <div className="font-semibold">Lowest Rate</div>
              <div>{Math.min(...analysis.lows).toFixed(4)}</div>
            </div>
            <div>
              <div className="font-semibold">Highest Rate</div>
              <div>{Math.max(...analysis.highs).toFixed(4)}</div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};