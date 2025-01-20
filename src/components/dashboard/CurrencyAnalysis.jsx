import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { basisUrl } from "@/utils/api";
import { toast } from "sonner";
import { formatNumber } from "./ScrollingRates";

export const CurrencyAnalysis = ({ pair }) => {
  const [analysis, setAnalysis] = React.useState(null);

  const fetchAnalysis = async () => {
    try {
      const currentDateTime = new Date().toISOString();
      const response = await axios.get(`${basisUrl}/api/rates/getrates`, {
        params: {
          currency: pair,
          startDate: currentDateTime.split("T")[0],
          endDate: currentDateTime,
        },
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

  const percentageChange = (
    ((analysis.top3Avg - analysis.minAvg) / analysis.minAvg) *
    100
  ).toFixed(2);
  const trendColor = percentageChange > 0 ? "text-green-500" : "text-red-500";

  return (
    <Card className="p-2">
      <CardContent className="p-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b pb-1">
            <h4 className="font-semibold">{pair}</h4>
            <span className={`text-sm ${trendColor}`}>{percentageChange}%</span>
          </div>

          <div className="text-xs space-y-2">
            <div>
              <div className="text-green-600 font-medium mb-1">Top 3 Rates</div>
              <div  className="flex justify-between">
                <span>BanffPay</span>
                <span>{formatNumber(analysis?.banffPayRate) || "null"}</span>
              </div>
              {analysis.top3.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.vendor}</span>
                  <span>{formatNumber(item.rate) || "null"}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <span className="text-green-900 font-semibold text-[20px]">
                Top 3 Rate Avg:
              </span>
              {/* <span>{analysis.minAvg.toFixed(4) || 'null'}</span> */}
              <span className="text-green-600">
                {formatNumber(analysis.top3Avg) || "null"}
              </span>
            </div>

            <div className="mt-2">
              <div className="text-red-600 font-medium mb-1">
                Bottom 3 Rates
              </div>
              {analysis.bottom3.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.vendor}</span>
                  <span>{formatNumber(item.rate) || "null"}</span>
                </div>
              ))}
            </div>

            <div className="text-xs border-t pt-1 space-y-1">
              {/* <div className="flex justify-between">
                <span>Top 5 Avg:</span>
                <span>{analysis.top3Avg.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bottom 5 Avg:</span>
                <span>{analysis.bottom3Avg.toFixed(4)}</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-red-900 font-semibold text-[20px]">
                  Bottom Rate Avg:
                </span>
                {/* <span>{analysis.minAvg.toFixed(4) || 'null'}</span> */}
                <span className="text-green-600">
                  {formatNumber(analysis.bottom3Avg) || "null"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
