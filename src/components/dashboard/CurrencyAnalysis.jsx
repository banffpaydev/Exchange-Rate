import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';
import { basisUrl } from '@/utils/api';
import { toast } from 'sonner';

export const CurrencyAnalysis = ({ pair }) => {
  const [analysis, setAnalysis] = React.useState(null);

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
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg">{pair}</h4>
            <span className={`font-bold ${trendColor}`}>{percentageChange}%</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Average:</span>
                <span className="ml-2">{analysis.Avgrate.toFixed(4)}</span>
              </div>
              <div>
                <span className="font-semibold">Low Avg:</span>
                <span className="ml-2">{analysis.lowAvg.toFixed(4)}</span>
              </div>
              <div>
                <span className="font-semibold">High Avg:</span>
                <span className="ml-2">{analysis.highAvg.toFixed(4)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="font-semibold text-green-600">Top 5:</div>
                <div className="grid grid-cols-5 gap-1">
                  {analysis.highs.slice(0, 5).map((rate, idx) => (
                    <div key={idx}>{rate.toFixed(2)}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-red-600">Bottom 5:</div>
                <div className="grid grid-cols-5 gap-1">
                  {analysis.lows.slice(0, 5).map((rate, idx) => (
                    <div key={idx}>{rate.toFixed(2)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};