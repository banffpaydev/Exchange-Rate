import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';
import { basisUrl } from '@/utils/api';
import axios from 'axios';
import { toast } from '../ui/use-toast';

export const AdminRateRowChn = ({ pair, rateData, id }) => {
  const [editedRates, setEditedRates] = useState(rateData);
  const [analysis, setAnalysis] = useState(null);

  const handleSave = async () => {
    try {
      const response = await axios.put(`${basisUrl}/api/current/pairs/${id}`, {
        exchangeRate: editedRates,
      });
      if (response.data != null) {
        toast.success("Rate data updated");
      }
    } catch (error) {
      toast.error("Unable to update Rates!!");
    }
  };

  const handleAnalysis = async () => {
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
      } else {
        throw new Error("Empty response data");
      }
    } catch (error) {
      console.error("Error fetching Rate Analysis:", error);
    }
  };

  return (
    <>
      <TableRow key={`${pair}`}>
        <TableCell>{pair}</TableCell>
        <TableCell>Banffpay</TableCell>
        <TableCell>{rateData?.toFixed(4) || 'N/A'}</TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.0001"
            value={editedRates || ''}
            onChange={(e) => setEditedRates(e.target.value)}
            className="w-32"
          />
        </TableCell>
        <TableCell>
          <Button onClick={handleSave} className="mr-2">Save</Button>
          <Button onClick={handleAnalysis}>Analyze</Button>
        </TableCell>
      </TableRow>

      {analysis && (
        <TableRow>
          <TableCell colSpan="5">
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-lg mb-4">Analysis Data</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-green-600 mb-2">Top Rates:</h5>
                  <div className="space-y-2">
                    {analysis.top5.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{item.vendor.toUpperCase()}:</span>
                        <span>{item.rate.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-red-600 mb-2">Bottom Rates:</h5>
                  <div className="space-y-2">
                    {analysis.bottom5.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{item.vendor.toUpperCase()}:</span>
                        <span>{item.rate.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <span className="font-semibold">Top 5 Average:</span>
                  <span className="ml-2">{analysis.top5Avg.toFixed(4)}</span>
                </div>
                <div>
                  <span className="font-semibold">Bottom 5 Average:</span>
                  <span className="ml-2">{analysis.bottom5Avg.toFixed(4)}</span>
                </div>
                <div>
                  <span className="font-semibold">Minimum Average:</span>
                  <span className="ml-2">{analysis.minAvg.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};