import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currencyPairs = [
  "USD/EUR", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD",
  "EUR/GBP", "USD/CAD", "NZD/USD", "EUR/JPY"
];

const vendors = ["Vendor A", "Vendor B", "Vendor C", "Vendor D", "Vendor E"];

const ExchangeRates = () => {
  const navigate = useNavigate();

  // In a real app, you'd fetch this data from an API
  const generateMockRates = () => {
    return vendors.map(vendor => ({
      vendor,
      rates: currencyPairs.map(() => (Math.random() * (1.5 - 0.5) + 0.5).toFixed(4))
    }));
  };

  const exchangeRates = generateMockRates();

  const handleRowClick = (pair) => {
    navigate(`/currency-pair/${pair}`);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Exchange Rates</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              {currencyPairs.map(pair => (
                <TableHead key={pair}>{pair}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {exchangeRates.map(({ vendor, rates }) => (
              <TableRow key={vendor} className="cursor-pointer hover:bg-gray-100">
                <TableCell className="font-medium">{vendor}</TableCell>
                {rates.map((rate, index) => (
                  <TableCell 
                    key={index} 
                    onClick={() => handleRowClick(currencyPairs[index])}
                  >
                    {rate}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExchangeRates;