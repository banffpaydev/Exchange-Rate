import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";
import { fetchDbRates } from "@/utils/api";
import Pagination from "@/components/ui/paginate";
import { usePaginationStore } from "../../store/store";
import { formatDate } from "@/utils/currencySymbols";

// Filtering function
export function filterRates(responseData, pair, fromDate, toDate) {
  let filteredRates = [];

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  for (const [date, rates] of Object.entries(responseData.data)) {
    const currentDate = new Date(date);

    if ((!from || currentDate >= from) && (!to || currentDate <= to)) {
      const filteredByPair = rates.filter((rate) =>
        pair ? rate.pair === pair : true
      );
      filteredRates = filteredRates.concat(filteredByPair);
    }
  }

  return filteredRates;
}

// const currencyPairs = [
//   'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
//   'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
// ];

const currencyPairs = [
  "CAD/NGN",
  "GHS/EUR",
  "GHS/CAD",
  "GHS/USD",
  "GHS/GBP",
  "EUR/GHS",
  "CAD/GHS",
  "USD/GHS",
  "GBP/GHS",
  "GBP/GMD",
  "GMD/GBP",
  "GMD/CAD",
  "GMD/EUR",
  "CAD/USD",
  "CAD/EUR",
  "CAD/GBP",
  "EUR/USD",
  "EUR/CAD",
  "EUR/GBP",
  "GBP/USD",
  "GBP/CAD",
  "GBP/EUR",
  "USD/NGN",
  "EUR/NGN",
  "GBP/NGN",
  "USD/LRD",
  "EUR/LRD",
  "GBP/LRD",
  "CAD/LRD",
  "GHS/NGN",
  "AED/NGN",
  "SLL/NGN",
  "RWF/NGN",
  "GHS/LRD",
  "AED/LRD",
  "SLL/LRD",
  "RWF/LRD",
  "NGN/USD",
  "NGN/EUR",
  "NGN/GBP",
  "NGN/CAD",
  "LRD/USD",
  "LRD/EUR",
  "LRD/GBP",
  "LRD/CAD",
  "NGN/GHS",
  "NGN/AED",
  "NGN/SLL",
  "NGN/RWF",
  "LRD/GHS",
  "LRD/AED",
  "LRD/SLL",
  "LRD/RWF",
  "USD/KES",
  "EUR/KES",
  "GBP/KES",
  "CAD/KES",
  "USD/ZMW",
  "EUR/ZMW",
  "GBP/ZMW",
  "CAD/ZMW",
  "USD/TZS",
  "EUR/TZS",
  "GBP/TZS",
  "CAD/TZS",
  "USD/XOF",
  "EUR/XOF",
  "GBP/XOF",
  "CAD/XOF",
  "USD/XAF",
  "EUR/XAF",
  "GBP/XAF",
  "CAD/XAF",
  "KES/USD",
  "KES/EUR",
  "KES/GBP",
  "KES/CAD",
  "ZMW/USD",
  "ZMW/EUR",
  "ZMW/GBP",
  "ZMW/CAD",
  "TZS/USD",
  "TZS/EUR",
  "TZS/GBP",
  "TZS/CAD",
  "XOF/USD",
  "XOF/EUR",
  "XOF/GBP",
  "XOF/CAD",
  "XAF/USD",
  "XAF/EUR",
  "XAF/GBP",
  "XAF/CAD",
  "KES/ZMW",
  "KES/TZS",
  "KES/XOF",
  "KES/XAF",
  "ZMW/TZS",
  "ZMW/XOF",
  "ZMW/XAF",
  "USD/CAD",
  "TZS/XOF",
  "TZS/XAF",
  "USD/GBP",
  "USD/EUR",
  "XOF/XAF",
  "USD/SLL",
  "SLL/NGN",
  "SLL/LRD",
  "NGN/SLL",
  "CAD/GMD",
  "EUR/GMD",
  "USD/GMD",
  "CAD/SLL",
  "GBP/SLL",
  "EUR/SLL",
  "GMD/USD",
  "NGN/LRD",
  "LRD/NGN",
];

function convertCurrencyPair(currencyPair) {
  const [baseCurrency, quoteCurrency] = currencyPair.split("/");
  return `${baseCurrency}-${quoteCurrency}`;
}

const TapExchangeRates = () => {
  const navigate = useNavigate();
  const [exchangeRates, setExchangeRates] = useState({});
  const [filteredRates, setFilteredRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState(currencyPairs[0]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [vendors, setVendors] = useState([]);
  const [pageMeta, setPageMeta] = useState({});
  const { currentPage } = usePaginationStore();

  function dataVendors(data) {
    let uniqueVendors = new Set();

    // Iterate through each date's rates
    for (let date in data) {
      let ratesArray = data[date];

      // Iterate through each rate object for the specific date
      ratesArray.forEach((rateObj) => {
        // Iterate through the vendors in the rates object
        for (let vendor in rateObj.rates) {
          if (vendor !== "undefined") {
            uniqueVendors.add(vendor);
          }
        }
      });
    }

    return Array.from(uniqueVendors);
  }

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetchDbRates(selectedPair, formatDate(startDate), formatDate(endDate),currentPage);
      const data = response.data?.data;
      setExchangeRates(data);
      setPageMeta(response.data?.meta);

      const vendorsAll = dataVendors(data);

      const firstDateRates = data[Object.keys(data)[0]][0];
      const vendorList = Object.keys(firstDateRates.rates).filter(
        (v) => v !== "undefined"
      );
      setVendors(vendorsAll);

      // Apply filtering
      const filtered = filterRates({ data }, selectedPair, startDate, endDate);
      setFilteredRates(filtered);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [selectedPair, startDate, endDate, currentPage]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleRowClick = (pair) => {
    navigate(`/currency-pair/${convertCurrencyPair(pair)}`);
  };

  const getCSVData = () => {
    return filteredRates.map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(),
      ...entry.rates,
    }));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Historical Exchange Rates</h1>
      <div className="flex space-x-4 mb-5">
        <Select onValueChange={setSelectedPair} value={selectedPair}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select currency pair" />
          </SelectTrigger>
          <SelectContent>
            {currencyPairs.map((pair) => (
              <SelectItem key={pair} value={pair}>
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker
          date={startDate}
          onDateChange={setStartDate}
          className="w-[180px]"
        />
        <DatePicker
          date={endDate}
          onDateChange={setEndDate}
          className="w-[180px]"
        />
        <Button onClick={fetchRates}>Refresh</Button>
        <CSVLink
          data={getCSVData()}
          filename={`historical_rates_${selectedPair}_${
            startDate.toISOString().split("T")[0]
          }_${endDate.toISOString().split("T")[0]}.csv`}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Download CSV
        </CSVLink>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {vendors
                  .filter((ven) => ven.toLowerCase() !== "abokifxng")
                  .map((vendor) => (
                    <TableHead key={vendor}>{vendor}</TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((entry, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(selectedPair)}
                >
                  <TableCell className="font-medium">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </TableCell>
                  {vendors
                    .filter((ven) => ven.toLowerCase() !== "abokifxng")
                    .map((vendor, index) => (
                      <TableCell key={index}>
                        {entry.rates[vendor] !== undefined &&
                        entry.rates[vendor] !== null
                          ? parseFloat(entry.rates[vendor])
                              .toFixed(2)
                              .toLocaleString("en-US")
                          : "N/A"}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={pageMeta?.currentPage}
            totalPages={pageMeta?.totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default TapExchangeRates;
