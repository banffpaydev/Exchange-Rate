import { useState, useEffect } from "react";
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
import { getRates } from "@/utils/api";
import { Input } from "@/components/ui/input";

// const currencyPairs = [
//   'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
//   'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
// ];

export const currencyPairs = [
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
  "CAD/NGN",
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
];

function convertCurrencyPair(currencyPair) {
  const [baseCurrency, quoteCurrency] = currencyPair.split("/");
  return `${baseCurrency}-${quoteCurrency}`;
}

const ExchangeRates = () => {
  const navigate = useNavigate();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [selectedPair, setSelectedPair] = useState(currencyPairs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());

  function dataVendors(data) {
    let uniqueKeys = new Set();
    for (let currency in data) {
      let rates = data[currency];
      for (let key in rates) {
        if (key !== "undefined") {
          uniqueKeys.add(key);
        }
      }
    }
    return Array.from(uniqueKeys);
  }

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await getRates();
      setExchangeRates(response.data);
      setVendors(dataVendors(response.data));
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [selectedPair, startDate, endDate]);

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
    if (!exchangeRates) return [];
    return Object.entries(exchangeRates).map(([pair, rates]) => ({
      pair,
      ...rates,
    }));
  };

  const hideRates = ["abokifxng", "cadrRemitRate", "sendWaveRate"];

  const filteredCurrencyPairs = Object.keys(exchangeRates || {}).filter(
    (pair) => pair.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Exchange Rates</h1>

      <div className="flex space-x-4 mb-5">
        {/* <Select onValueChange={setSelectedPair} value={selectedPair}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select currency pair" />
          </SelectTrigger>
          <SelectContent>
            {filteredCurrencyPairs.map((pair) => (
              <SelectItem key={pair} value={pair}>
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <Input
          type="text"
          className="max-w-[200px]"
          placeholder="search pair"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
        {/* <DatePicker
          date={startDate}
          onDateChange={setStartDate}
          className="w-[180px]"
        />
        <DatePicker
          date={endDate}
          onDateChange={setEndDate}
          className="w-[180px]"
        /> */}
        <Button onClick={fetchRates}>Refresh</Button>
        <CSVLink
          data={getCSVData()}
          filename={`exchange_rates_${selectedPair}_${
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
                <TableHead>Currency Pair</TableHead>
                {vendors
                  .filter((ven) => !hideRates.includes(ven))
                  .sort((a, b) => {
                    if (a === "BanffPay Rate") return -1;
                    if (b === "BanffPay Rate") return 1;
                    return 0;
                  })
                  .map((vendor) => (
                    <TableHead key={vendor} className={vendor === "BanffPay Rate" ? "text-[#0097ff] font-bold" : ""}>
                      {vendor === "CadRemit Exchange" ? "CadRemit" : vendor}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCurrencyPairs.map((pair) => (
                <TableRow
                  key={pair}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell
                    className="font-medium"
                    onClick={() => handleRowClick(pair)}
                  >
                    {pair}
                  </TableCell>
                  {vendors
                    .filter((ven) => !hideRates.includes(ven))
                    .sort((a, b) => {
                      if (a === "BanffPay Rate") return -1;
                      if (b === "BanffPay Rate") return 1;
                      return 0;
                    })
                    .map((vendor, index) => (
                      <TableCell key={index} className={vendor === "BanffPay Rate" ? "text-[#0097ff] font-bold" : ""}>
                        {exchangeRates[pair][vendor] !== undefined &&
                        exchangeRates[pair][vendor] !== null
                          ? parseFloat(exchangeRates[pair][vendor])
                              .toFixed(2)
                              .toLocaleString("en-US")
                          : "N/A"}
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
