import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRates } from '@/utils/api';

function convertCurrencyPair(currencyPair) {
  const [baseCurrency, quoteCurrency] = currencyPair.split("/");
  return `${baseCurrency}-${quoteCurrency}`;
}

// const currencyPairs = [
//   "USD/AOA", "USD/GHS", "USD/CAD", "USD/NGN", "USD/SLL", 
//   "USD/XOF", "USD/GBP", "USD/EUR", "USD/CNY"
// ];

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];



const ExchangeRates = () => {
  const navigate = useNavigate();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  // Function to extract unique vendors
  function dataVendors(data) {
    let uniqueKeys = new Set();

    // Loop through each entry in the data object
    for (let currency in data) {
      let rates = data[currency];

      // Loop through each key in the current currency object
      for (let key in rates) {
        if (key !== "undefined") {
          uniqueKeys.add(key); // Add key if it's not 'undefined'
        }
      }
    }

    // Convert the Set to an array and return it
    return Array.from(uniqueKeys);
  }

  // Function to fetch rates
  const fetchRates = async () => {
    setLoading(true);
    try {
      // Simulate an API response
      const response = await getRates();
      
      setExchangeRates(response.data); // Assuming the response structure has "data"
      setVendors(dataVendors(response.data)); // Set vendors from response data
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


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if no token is found
      navigate('/login');
    }
  }, [navigate]);

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
                {vendors.map(vendor => (
                  <TableHead key={vendor}>{vendor}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencyPairs.map(pair => (
                <TableRow key={pair} className="cursor-pointer hover:bg-gray-100">
                  <TableCell className="font-medium" onClick={() => handleRowClick(pair)}>{pair}</TableCell>
                  {vendors.map((vendor, index) => (
                    <TableCell key={index}>
                      {
                        exchangeRates[pair]?.[vendor] !== undefined && exchangeRates[pair]?.[vendor] !== null 
                          ? exchangeRates[pair][vendor].toFixed(2)
                          : "N/A"
                      }
                    </TableCell>
                  ))}
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
