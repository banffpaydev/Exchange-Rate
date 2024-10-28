import axios from "axios";
import dotenv from 'dotenv';
import ExchangeRate from "../models/ExchangeRate";
import { Op } from "sequelize";
import { calculateStats } from "../controllers/treps";
import { createCurrencyPair } from "./currencyPairService";

dotenv.config();



const lemfiRate = async (from: string, to: string) => {
    try {    const response = await axios.post(`https://lemfi.com/api/lemonade/v2/exchange`, 
            {
                from, to
            }
        );
        const data = response.data.data;
        return { name: 'Lemfi', rate: Number(data.rate) };
    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        return {msg: "error message", err}
    }
}


const afriXchangeRate = async (from: string, to: string) => {
    try {
        // https://client.africhange.com/api/Rate?sendingCurrencyCode=NGN&receivingCurrencyCode=GBP
        const response = await axios.get(`https://client.africhange.com/api/Rate?sendingCurrencyCode=${from}&receivingCurrencyCode=${to}`);
        const data = response.data.data;
        // console.log('afriXChange: ', data);
        return { name: 'Afri Exchange', rate: Number(data.exchangeRateToDisplay) };
    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        return {msg: "error message", err}
    }
}

const getRateByCurrency = (data: any, isoCode: string) => {
    const upperCaseIsoCode = isoCode.toUpperCase();
    
    // Find the currency rate
    const rate = data.rates[upperCaseIsoCode];
  
    // Return the rate if found, or a message if the currency is not available
    return rate
  };


const xeRates = async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://www.xe.com/api/protected/midmarket-converter/`, {
            headers: {
                'Authorization': 'Basic bG9kZXN0YXI6cHVnc25heA==',
            }
        });
        const data = response.data;
        const ratings = getRateByCurrency(data, to);
        // console.log('xeRates: ', ratings);
        return { name: 'Xe Exchange', rate: Number(ratings) };
    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        return {msg: "error message", err}
    }
}


// Under Review``
const remitlyRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://api.remitly.io/v3/calculator/estimate?conduit=USA%3AUSD-NGA%3ANGN&anchor=SEND&amount=&purpose=OTHER&customer_segment=UNRECOGNIZED&strict_promo=false`);
        const data = response.data.data;
        
        // console.log('rately: ', data);
        return { name: 'Afri Exchange', rate: Number(data.exchangeRateToDisplay) };
    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        return {msg: "error message", err}
    }
}

// End Here
  

const cadrRemitRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://corsproxy.io/?https%3A%2F%2Fapi.cadremit.com%2Fv1%2Fadmin%2Fsettings`);
        const data = response.data.data;
        const rates = data.rates;
        console.log('cadrRemit: ', data);

        if (rates[from] && rates[from][to]) {
            const exchangeInfo = rates[from][to];
        
            // Handle the case where exchange information is stored as a string (e.g., "USD:CAD")
            if (typeof exchangeInfo === 'string') {
              return {
                // @ts-ignore
                name: 'CadrRemit Exchange', rate: Number(exchangeInfo.sell)
              };
            }

            // console.log('CadrRemit Exchange: result: ',exchangeInfo.sell)
        
            // Return the "buy" and "sell" rates
            return {
                name: 'CadrRemit Exchange', rate: Number(exchangeInfo.buy),
                sellRate: exchangeInfo.sell
            };
          } else {
            // Handle cases where the exchange rate does not exist
            return {
              error: `Exchange rate between ${from} and ${to} not found.`
            };
          }

        return { name: 'CadrRemit Exchange', rate: Number(data.exchangeRateToDisplay) };
    } catch (err: any) {
        // console.error('Error fetching CardRemit Exchange rate:', err);
        return {msg: "error message", err}
    }
}


const wiseRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://wise.com/rates/live?source=${from}&target=${to}&length=30&resolution=hourly&unit=day`);
        const data = response.data;
        return { name: 'Wise Exchange', rate: Number(data.value) };
    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        return {msg: "error message", err}
    }
}


const transfergoRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://my.transfergo.com/api/fx-rates?from=${from}&to=${to}&amount=2`);
        const data = response.data;
        return { name: 'TransferGo Exchange', rate: Number(data.rate) };
    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        // return { name: 'TransferGo Exchange', rate: 'N/A' }
        return {msg: "error message", err}
    }
}

const twelveDataRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://api.twelvedata.com/exchange_rate?symbol=${from}/${to}&apikey=${process.env.TWELVEDATA_API_KEY}`);
        const data = response.data;
        return { name: 'twelveData Exchange', rate: Number(data.rate) };
    } catch (err: any) {
        // console.error('Error fetching twelveData Exchange rate:', err);
        // return { name: 'twelveData Exchange', rate: 'N/A' }
        return {msg: "error message", err}
    }
}

const alphaVantageRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
        const data = response.data;
        const treansferty = data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        return { name: 'alphaVantage Exchange', rate: Number(treansferty) };
    } catch (err: any) {
        // console.error('Error fetching alphaVantage Exchange rate:', err);
        // return { name: 'alphaVantage Exchange', rate: 'N/A' }
        return {msg: "error message", err}
    }
}


const xchangeRtRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${from}/${to}`);
        const data = response.data;
        return { name: 'xchangeRt Exchange', rate: Number(data.conversion_rate) };
    } catch (err: any) {
        // console.error('Error fetching xchangeRtRate Exchange rate:', err);
        // return { name: 'xchangeRt Exchange', rate: 'N/A' }
        return {msg: "error message", err}
    }
}


const xchangeRtOrgRate =  async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://www.exchange-rates.org/api/v2/rates/lookup?isoTo=${to}&isoFrom=${from}&amount=1&pageCode=Home`);
        const data = response.data;
        return { name: 'Exchange-Rate Org Exchange', rate: Number(data.Rate) };
    } catch (err: any) {
        // console.error('Error fetching xchangeRtRate Exchange rate:', err);
        // return { name: 'xchangeRt Exchange', rate: 'N/A' }
        return {msg: "error message", err}
    }
}

// https://www.exchange-rates.org/api/v2/rates/lookup?isoTo=NGN&isoFrom=USD&amount=1&pageCode=Home

// Saving Data to Database

// const saveExchangeRates = async (data: any) => {
//     const exchangeRateRepository = getRepository(ExchangeRate);

//     for (const pair in data) {
//         const rates = data[pair];

//         // Create new exchange rate entity
//         const exchangeRate = new ExchangeRate();
//         exchangeRate.pair = pair;
//         exchangeRate.rates = rates;

//         // Save to the database
//         await exchangeRateRepository.save(exchangeRate);
//     }
// };\



const saveExchangeRate = async (pair: any, data: any) => {
    await ExchangeRate.create({
        pair: pair,
        rates: data
    });
};


const fetchExchangeRate = async (pair: string) => {
    const exchangeRate = await ExchangeRate.findOne({ where: { pair } });
    if (exchangeRate) {
        console.log(exchangeRate.rates); // Will output the JSON with rates
    } else {
        console.log("Rate not found for the pair:", pair);
    }
};


// Handle ALl fetch
// export const handleAllFetch = async () => {
//     const pairs = ['USD/AOA', 'USD/GHS', 'USD/CAD', 'USD/NGN', 'USD/SLL', 'USD/XOF', 'USD/GBP', 'USD/EUR', 'USD/CNY'];
//     const apis = [lemfiRate, afriXchangeRate, wiseRate, transfergoRate, twelveDataRate, alphaVantageRate, xchangeRtRate, xeRates, xchangeRtOrgRate];
    
//     const results: Record<string, Record<string, number | null>> = {};

//     // Iterate over each currency pair
//     for (const pair of pairs) {
//         const [from, to] = pair.split('/');
        
//         results[pair] = {};

//         // Iterate over each API and fetch rates
//         for (const api of apis) {
//             try {
//                 const rateData = await api(from, to);

//                 // Ensure rate is present, otherwise return null
//                 if (rateData && rateData.rate !== undefined) {
//                     results[pair][rateData.name] = rateData.rate;

//                 } else {
//                     // @ts-ignore
//                     results[pair][rateData.name] = null; // Return null for missing rate
//                 }

//             } catch (err: any) {
//                 // // console.error(`Error fetching rate for ${pair} from ${api.name}:`, err);
//                 results[pair][api.name] = null; // Return null if API fails
//             }
//         }
//         // await saveExchangeRate(pair, results[pair]);
//     }
//     // await saveExchangeRate(results);
//     await saveDatatoDb(results);
//     return results;
// };


export const handleAllFetch = async () => {
    const pairs = [
        'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN', 'CNY/NGN',
        'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD', 'CNY/LRD'
    ];
    const apis = [lemfiRate, afriXchangeRate, wiseRate, transfergoRate, twelveDataRate, alphaVantageRate, xchangeRtRate, xeRates, xchangeRtOrgRate];
    
    const results: Record<string, Record<string, number | null>> = {};

    for (const pair of pairs) {
        const [from, to] = pair.split('/');
        results[pair] = {};

        for (const api of apis) {
            try {
                const rateData = await api(from, to);

                if (rateData && rateData.rate !== undefined) {
                    results[pair][rateData.name] = rateData.rate;
                } else {
                    // @ts-ignore
                    results[pair][rateData.name] = null;
                }
            } catch (err: any) {
                results[pair][api.name] = null;
            }
        }
        const stats = calculateStats({ [pair]: results[pair] });

        const pairData = {
            currencyPair: pair,
            exchangeRate: stats[pair].mean
        }
        await createCurrencyPair(pairData);
        await saveExchangeRate(pair, results[pair]);
    }

    await saveDatatoDb(results);
    return results;
};


export const saveDatatoDb = async (data: any) => {
    try {
        for (const pair in data) {
            await saveExchangeRate(pair, data[pair]);
        }
        return {msg: 'Dat saved'}
    } catch (error: any) {
        console.log(error);
        return { error: "Error sasving data" }        
    }
}


export const getRatesFromDBPairs = async (pair: string) => {
    try {
        const exchangeRate = await ExchangeRate.findAll({ where: { pair } });

        if (!exchangeRate) {
            throw new Error(`Exchange rate for pair ${pair} not found`);
        }

        return exchangeRate;
    } catch (error: any) {
        throw new Error(`Failed to fetch exchange rate: ${error.message}`);
    }
}


// export const getRatesFromDB = async () => {
//     try {
//         const exchangeRate = await ExchangeRate.findAll({ raw: true });

//         if (!exchangeRate) {
//             throw new Error(`Exchange rates not found`);
//         }

//         return exchangeRate;
//     } catch (error: any) {
//         throw new Error(`Failed to fetch exchange rate: ${error.message}`);
//     }
// }

export const getRatesFromDB = async () => {
    try {
        // Fetch all exchange rates with raw data
        const exchangeRates = await ExchangeRate.findAll({
            raw: true,
            attributes: ['id', 'pair', 'rates', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'ASC']] // Ensure the rates are ordered by creation date
        });

        if (!exchangeRates || exchangeRates.length === 0) {
            throw new Error(`Exchange rates not found`);
        }

        // Grouping the data by 'createdAt' date
        const groupedByDate = exchangeRates.reduce((acc, rate) => {
            // Get the date in 'YYYY-MM-DD' format (ignoring time)
            const dateKey = new Date(rate.createdAt).toISOString().split('T')[0];

            // If the date key doesn't exist in the accumulator, create an empty array for it
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }

            // Push the current rate into the corresponding date group
            acc[dateKey].push(rate);

            return acc;
        }, {} as { [key: string]: any[] }); // Initial accumulator is an empty object

        return groupedByDate;
    } catch (error: any) {
        throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
};


export const getAnalyzedRates = async (currency: string, startDate: string, endDate: string) => {
    // Query for matching currency pairs within the given date range
    const rates = await ExchangeRate.findAll({
        where: {
            pair: { [Op.like]: `%${currency}%` },
            createdAt: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        },
        order: [['createdAt', 'ASC']]  // Sort by date ascending
    });


    // Extract rates from results
    // const rateValues = rates.map((rate: any) => rate.rates[currency] || 0);

    const rateValues = rates.map((rate: any) => rate.rates);


    const exchangeRates: number[] = rateValues.flatMap(entry =>
        Object.values(entry).filter((rate): rate is number => rate !== null && rate !== 0)
    );

    const calculateAverage = (rates: number[]): number =>
        rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

    const sortedRates = [...exchangeRates].sort((a, b) => a - b);

    // Get the lowest five rates
    const lowestFiveRates = sortedRates.slice(0, 5);

    // Get the highest five rates
    const highestFiveRates = sortedRates.slice(-5).reverse();

    // console.log("Lowest five rates:", lowestFiveRates);
    // console.log("Highest five rates:", highestFiveRates);

    // // Sort rates from lowest to highest
    // rateValues.sort((a: number, b: number) => a - b);

    // // Get top 5 highest rates
    // const top5Rates = rateValues.slice(-5);
    // const top5Avg = top5Rates.reduce((acc, rate) => acc + rate, 0) / top5Rates.length;

    // // Get bottom 5 lowest rates
    // const bottom5Rates = rateValues.slice(0, 5);
    // const bottom5Avg = bottom5Rates.reduce((acc, rate) => acc + rate, 0) / bottom5Rates.length;



    return {
        lows: lowestFiveRates,
        highs: highestFiveRates,
        lowAvg: calculateAverage(lowestFiveRates),
        highAvg: calculateAverage(highestFiveRates),
        Avgrate: calculateAverage([calculateAverage(lowestFiveRates), calculateAverage(highestFiveRates)])
    };
};







