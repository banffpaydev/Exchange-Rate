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
        // toast.success("Rate Analysis fetched");
        setAnalysis(response.data);
      } else {
        throw new Error("Empty response data");
      }
    } catch (error) {
      console.error("Error fetching Rate Analysis:", error); // Provides details of the actual error
      // toast.error("Unable to fetch Rate Analysis!");
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
            <div className="p-2 flex gap-2 relative">
              <h4 className='absolute top-0 left-2 mb-3'>Analysis Data</h4>
              <div>
                <strong>Lows:</strong>
                {analysis.lows.map((low, index) => (
                  <div key={index}>Low {index + 1}: {low.toFixed(2)}</div>
                ))}
              </div>
              <div>
                <strong>Highs:</strong>
                {analysis.highs.map((high, index) => (
                  <div key={index}>High {index + 1}: {high.toFixed(2)}</div>
                ))}
              </div>
              <div><strong>Average Low:</strong> {analysis.lowAvg.toFixed(2)}</div>
              <div><strong>Average High:</strong> {analysis.highAvg.toFixed(2)}</div>
              <div><strong>Overall Average Rate:</strong> {analysis.Avgrate.toFixed(2)}</div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
