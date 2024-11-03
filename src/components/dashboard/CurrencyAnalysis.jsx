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

  const percentageChange = ((analysis.top5Avg - analysis.minAvg) / analysis.minAvg * 100).toFixed(2);
  const trendColor = percentageChange > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg">{pair}</h4>
            <span className={`font-bold ${trendColor}`}>{percentageChange}%</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="font-semibold text-green-600">Top Vendors:</div>
                {analysis.top5.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="uppercase font-medium">{item.vendor}</span>
                    <span>{item.rate.toFixed(4)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold text-red-600">Bottom Vendors:</div>
                {analysis.bottom5.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="uppercase font-medium">{item.vendor}</span>
                    <span>{item.rate.toFixed(4)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold">Top 5 Average:</span>
                  <span>{analysis.top5Avg.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Bottom 5 Average:</span>
                  <span>{analysis.bottom5Avg.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Minimum Average:</span>
                  <span>{analysis.minAvg.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};