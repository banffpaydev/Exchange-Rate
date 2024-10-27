import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';
import { basisUrl } from '@/utils/api';
import axios from 'axios';
import { toast } from '../ui/use-toast';


export const AdminRateRowChn = ({ pair, rateData, id }) => {
  const [editedRates, setEditedRates] = useState(rateData)

  const handleSave = async() => {
    try {
      const response = await axios.put(`${basisUrl}/api/current/pairs/${id}`, {
        exchangeRate: editedRates,
      })
      if (response.data != null) {
        toast.success("Rate data updated");
      }
    } catch (error) {
      toast.error("Unable to update Rates!!")
    }
  } 
  return (
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
        <Button onClick={handleSave}>save</Button>
      </TableCell>
    </TableRow>
  );
};