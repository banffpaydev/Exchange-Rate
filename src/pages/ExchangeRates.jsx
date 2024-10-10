import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchDbRates, getRates } from '@/utils/api';

function convertCurrencyPair(currencyPair) {
  const [baseCurrency, quoteCurrency] = currencyPair.split("/");
  return `${baseCurrency}-${quoteCurrency}`;
}

const currencyPairs = [
  "USD/AOA", "USD/GHS", "USD/CAD", "USD/NGN", "USD/SLL", 
  "USD/XOF", "USD/GBP", "USD/EUR", "USD/CNY"
];

const ExchangeRates = () => {
  const navigate = useNavigate();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch rates from the API
  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await getRates();
      console.log("rates/: ", response);
      setExchangeRates(response.data); // Assuming the response structure has "data"
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rates on component mount
  useEffect(() => {
    fetchRates();
  }, []);

  const handleRowClick = (pair) => {
    navigate(`/currency-pair/${convertCurrencyPair(pair)}`);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Exchange Rates</h1>
      
      {/* Refresh Button */}
      <button 
        className="mb-5 px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={fetchRates}
      >
        Refresh
      </button>

      {/* Show loading text */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency Pair</TableHead>
                {Object.keys(exchangeRates[currencyPairs[0]])
                  .filter(vendor => vendor !== "undefined") // Exclude 'undefined' vendor
                  .map(vendor => (
                    <TableHead key={vendor}>{vendor}</TableHead>
                  ))
                }
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencyPairs.map(pair => (
                <TableRow key={pair} className="cursor-pointer hover:bg-gray-100">
                  <TableCell className="font-medium" onClick={() => handleRowClick(pair)}>{pair}</TableCell>
                  {Object.entries(exchangeRates[pair])
                    .filter(([vendor]) => vendor !== "undefined") // Exclude 'undefined' vendor
                    .map(([vendor, rate], index) => (
                      <TableCell key={index}>
                        {rate !== null ? rate : "N/A"}
                      </TableCell>
                    ))
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ExchangeRates;
