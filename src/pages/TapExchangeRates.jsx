import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchDbRates, getRates } from '@/utils/api';

// Define the list of all vendors
const vendorsList = [
  "Lemfi",
  "Wise_Exchange",
  "TransferGo_Exchange",
  "twelveData_Exchange",
  "alphaVantage_Exchange",
  "xchangeRt_Exchange",
  "undefined" // Include 'undefined' as a vendor
];

function convertCurrencyPair(currencyPair) {
    const [baseCurrency, quoteCurrency] = currencyPair.split("/");
    return `${baseCurrency}-${quoteCurrency}`;
  }

const TapExchangeRates = () => {
  const navigate = useNavigate();
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch rates from the API
  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetchDbRates();
      console.log("rates/: ", response);
      setExchangeRates(response.data); // Set the rates data directly
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
                {/* Render all vendors as table headers */}
                {vendorsList.map(vendor => (
                  <TableHead key={vendor}>{vendor}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map(({ pair }) => (
                <TableRow key={pair} className="cursor-pointer hover:bg-gray-100" onClick={() => handleRowClick(pair)}>
                  <TableCell className="font-medium" >{pair}</TableCell>
                  {vendorsList.map(vendor => {
                    const rate = exchangeRates.find(rate => rate.pair === pair)?.rates[vendor] || null; // Get the rate or set to null
                    return (
                      <TableCell key={vendor}>
                        {rate !== null ? rate : "N/A"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TapExchangeRates;
