import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export const AdminRateRow = ({ pair, rateData, editedRates, onRateChange }) => {
  return Object.entries(rateData).map(([vendor, rate]) => (
    <TableRow key={`${pair}-${vendor}`}>
      <TableCell>{pair}</TableCell>
      <TableCell>{vendor}</TableCell>
      <TableCell>{rate?.toFixed(4) || 'N/A'}</TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.0001"
          value={editedRates[pair]?.[vendor] || ''}
          onChange={(e) => onRateChange(pair, vendor, e.target.value)}
          className="w-32"
        />
      </TableCell>
    </TableRow>
  ));
};