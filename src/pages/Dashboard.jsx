import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { fetchDbRates, getRates } from '@/utils/api';

const timeframes = ['1D', '1M', '3M', '1Y', '5Y', 'All'];

const currencyPairs = [
  'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
  'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
];

const colors = {
  'USD/NGN': '#00897B',
  'EUR/NGN': '#4CAF50',
  'GBP/NGN': '#2196F3',
  'CAD/NGN': '#9C27B0',
  'CNY/NGN': '#FF9800',
  'USD/LRD': '#F44336',
  'EUR/LRD': '#3F51B5',
  'GBP/LRD': '#009688',
  'CAD/LRD': '#FF5722',
  'CNY/LRD': '#795548'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [sparklineData, setSparklineData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedPairs, setSelectedPairs] = useState(
    currencyPairs.reduce((acc, pair) => ({ ...acc, [pair]: true }), {})
  );
  const [displayedRates, setDisplayedRates] = useState(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  const calculateMean = (rates) => {
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  };
  
  const calculateMedian = (rates) => {
    const sorted = [...rates].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  
  // Main function to process data
  const calculateStats = (data) => {
    const result = {};
  
    for (const [currencyPair, ratesObj] of Object.entries(data)) {
      // Extract rates, filtering out null or zero values
      const rates = Object.values(ratesObj).filter((rate) => rate !== null && rate !== 0);
  
      if (rates.length > 0) {
        // Calculate statistics
        const mean = calculateMean(rates);
        const median = calculateMedian(rates);
  
        // Sort rates to find highest and lowest two
        const sortedRates = [...rates].sort((a, b) => a - b);
        const lowestTwo = sortedRates.slice(0, 2);
        const highestTwo = sortedRates.slice(-2);
  
        result[currencyPair] = { mean, median, highestTwo, lowestTwo };
      }
    }
  
    return result;
  };

  // const fetchRates = async () => {
  //   try {
  //     const response = await getRates();
  //     setRates(response.data);
  //     console.log(calculateStats(response.data))
      
  //     const newDataPoint = {
  //       timestamp: new Date().toLocaleTimeString(),
  //       ...Object.keys(response.data).reduce((acc, pair) => ({
  //         ...acc,
  //         [pair]: response.data[pair]?.['Wise Exchange'] || 0
  //       }), {})
  //     };

  //     setHistoricalData(prevData => {
  //       const newData = [...prevData, newDataPoint];
  //       return newData.slice(-20);
  //     });

  //     // Update sparkline data for each pair
  //     setSparklineData(prevData => {
  //       const newSparklineData = { ...prevData };
  //       Object.keys(response.data).forEach(pair => {
  //         const rate = response.data[pair]?.['Wise Exchange'] || 0;
  //         newSparklineData[pair] = [
  //           ...(prevData[pair] || []),
  //           { value: rate, timestamp: new Date().toLocaleTimeString() }
  //         ].slice(-10);
  //       });
  //       return newSparklineData;
  //     });

  //     setLoading(false);
  //   } catch (error) {
  //     toast.error("Failed to fetch rates");
  //     console.error("Failed to fetch rates:", error);
  //   }
  // };

  const fetchRates = async () => {
    try {
      // Fetch historical data from the database
      const dbResponse = await fetchDbRates();
      const dbData = dbResponse.data || {};

      // Initialize historicalData with data from DB
      const formattedDbData = Object.entries(dbData).map(([date, pairs]) => {
        return {
          timestamp: date,
          ...pairs.reduce((acc, pairData) => {
            acc[pairData.pair] = pairData.rates["Wise Exchange"] || 0;
            return acc;
          }, {})
        };
      });
      setHistoricalData(formattedDbData);

      // Fetch real-time data
      const response = await getRates();
      const newDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        ...Object.keys(response.data).reduce((acc, pair) => ({
          ...acc,
          [pair]: response.data[pair]?.['Wise Exchange'] || 0
        }), {})
      };

      const tribe = calculateStats(response.data);
      console.log(tribe)
      setDisplayedRates(tribe);

      // Append real-time data to historical data
      setHistoricalData(prevData => {
        const newData = [...prevData, newDataPoint];
        return newData.slice(-100); // Keep the most recent 100 points
      });

      // Update sparkline data with real-time data
      setSparklineData(prevData => {
        const newSparklineData = { ...prevData };
        Object.keys(response.data).forEach(pair => {
          const rate = response.data[pair]?.['Wise Exchange'] || 0;
          newSparklineData[pair] = [
            ...(prevData[pair] || []),
            { value: rate, timestamp: new Date().toLocaleTimeString() }
          ].slice(-10); // Keep the latest 10 points
        });
        return newSparklineData;
      });

      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch rates");
      console.error("Failed to fetch rates:", error);
    }
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const togglePair = (pair) => {
    setSelectedPairs(prev => ({
      ...prev,
      [pair]: !prev[pair]
    }));
  };

  const handlePrevPair = () => {
    setCurrentPairIndex(prev => (prev > 0 ? prev - 1 : currencyPairs.length - 1));
  };

  const handleNextPair = () => {
    setCurrentPairIndex(prev => (prev < currencyPairs.length - 1 ? prev + 1 : 0));
  };

  const getPercentageChange = (pair) => {
    const pairData = sparklineData[pair] || [];
    if (pairData.length < 2) return 0;
    const lastRate = pairData[pairData.length - 1].value;
    const previousRate = pairData[pairData.length - 2].value;
    return ((lastRate - previousRate) / previousRate * 100).toFixed(2);
  };

  const isPositiveChange = (pair) => {
    return parseFloat(getPercentageChange(pair)) >= 0;
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        {/* <h1 className="text-2xl font-bold mb-2">Forex market</h1> */}
        <h2 className="text-3xl font-bold mb-6">Overview</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Currency pairs</h3>
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevPair}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 overflow-x-auto">
            <div className="flex space-x-4">
              {currencyPairs.map((pair, index) => (
                <Card 
                  key={pair}
                  className={`p-4 min-w-[200px] cursor-pointer ${index === currentPairIndex ? 'bg-blue-50' : ''}`}
                  onClick={() => setCurrentPairIndex(index)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pair}</div>
                        {/* <div className="text-2xl">{rates[pair]?.['Wise Exchange']?.toFixed(4) || 'N/A'}</div> */}
                        <div className="text-2xl">
                        {displayedRates[pair]?.mean?.toFixed(2) || 'N/A'}
                        </div>
                      </div>
                      <div className={`text-sm ${isPositiveChange(pair) ? 'text-green-500' : 'text-red-500'}`}>
                        {getPercentageChange(pair)}%
                      </div>
                    </div>
                    <div className="h-[40px] mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData[pair] || []}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={isPositiveChange(pair) ? '#22c55e' : '#ef4444'}
                            dot={false}
                            strokeWidth={1}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextPair}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                onClick={() => setSelectedTimeframe(timeframe)}
                className="text-sm"
              >
                {timeframe}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                label={{ value: 'Time', position: 'bottom' }}
              />
              <YAxis label={{ value: 'Exchange Rate', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend onClick={(e) => togglePair(e.dataKey)} />
              {currencyPairs.map((pair) => (
                selectedPairs[pair] && (
                  <Line
                    key={pair}
                    type="monotone"
                    dataKey={pair}
                    stroke={colors[pair]}
                    name={pair}
                    dot={false}
                    strokeWidth={2}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;