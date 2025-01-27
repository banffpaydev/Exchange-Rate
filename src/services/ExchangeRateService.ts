import axios, { all } from "axios";
import dotenv from 'dotenv';
import ExchangeRate from "../models/ExchangeRate";
import { Op } from "sequelize";
import { calculateStats, inversePair } from "../controllers/treps";
import { createCurrencyPair, createRawCurrencyPair, getAdditionalRates, getAdditionalRatesId, getAllCurrencyPairs, getCurrencyPairByPair } from "./currencyPairService";
import RawExchangeRate from "../models/RawExchangeRate";
import RawCurrencyPair from "../models/RawCurrencyPair";
import nodemailer from "nodemailer";
import ExchangeCountries from "../models/ExchangeCountries";
import sequelize from "../config/db";
import { getPairById } from "../controllers/currencyPairController";
import InternalRate from "../models/internalRate";
import { autoUpdateInternalRatesOnFetch, getInternalRateByPair } from "./internalRateService";
import { matchesGlob } from "path";

dotenv.config();
export const username = process.env.USER_NAME;
export const password = process.env.PASSWORD;
export const host = process.env.HOST;
export const nodemailer_port =
    parseInt(process.env.NODEMAILER_PORT ?? "") || 587;

export const transporter = nodemailer.createTransport({
    host: `${host}`,
    port: nodemailer_port,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: `${username}`,
        pass: `${password}`,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


const lemfiRate = async (from: string, to: string) => {
    //console.log("lemfi started")
    try {
        const response = await axios.post(`https://lemfi.com/api/lemonade/v2/exchange`,
            {
                from, to
            }
        );
        const data = response.data.data;
        const vape = Number(data.rate)

        if (from === 'NGN' || from === 'ngn' || from === 'LRD' || from === "lrd") {
            return { name: 'Lemfi', rate: 1 / vape, rawRate: vape };
        }

        return { name: 'Lemfi', rate: Number(data.rate), rawRate: vape };
    } catch (err: any) {
        // //console.error('Error fetching Afri Exchange rate:', err);
        return { msg: "error message", err }
    }
}


const afriXchangeRate = async (to: string, from: string) => {
    //console.log("Afri Exchange started")
    try {
        // https://client.africhange.com/api/Rate?sendingCurrencyCode=NGN&receivingCurrencyCode=GBP
        const response = await axios.get(`https://client.africhange.com/api/Rate?sendingCurrencyCode=${to}&receivingCurrencyCode=${from}`);
        const data = response.data.data;
        const exchangeRate = data.exchangeRate
        if (exchangeRate) {
            return { name: 'Afri Exchange', rate: Number(exchangeRate), rawRate: Number(exchangeRate) };
        } else {
            return { name: 'Afri Exchange', rate: null, rawRate: null };
        }
    } catch (err: any) {
        // //console.error('Error fetching Afri Exchange rate:', err);
        return { msg: "error message", err }
    }
}
const abokiDefault = ['EUR', 'GBP', 'USD'];

function isStringInArray(target: string, array: string[]): boolean {
    return array.includes(target.toUpperCase());
}





export const abokifxng = async (from: string, to: string) => {
    //console.log('Aboki FX Started')
    try {
        const response = await getCurrencyRate(from, to);

        // if (String(to.toLowerCase()) !== 'ngn') {
        //     //console.log(false)
        //     return { name: 'Abokifx', rate: null };
        // }
        // Check if the requested currency exists in the response data
        // if (!data[to.toLowerCase()] && String(to.toLowerCase()) !== 'ngn') {
        //   return { name: 'Abokifx', rate: null };
        // }



        // Get the rates for the specified currency
        // const rates = data[from.toLowerCase()];

        // Find the most recent rate by sorting rates based on timestamp in descending order
        // const mostRecentRate = rates
        //   .sort((a: [number, number], b: [number, number]) => b[0] - a[0])[0];
        // //console.log("most rescnt: ", mostRecentRate);
        // Return the most recent rate information
        // const druie = rates[rates.length - 1]

        return { name: 'Abokifx', rate: response, rawRate: response };
    } catch (err: any) {
        return { msg: "Error fetching rate", err };
    }
};


const getRateByCurrency = (data: any, isoCode: string, from: string) => {
    const upperCaseIsoCode = isoCode.toUpperCase();
    const upperFrom = from.toUpperCase();

    // Find the currency rate
    const rate = data.rates[upperCaseIsoCode];
    const fromRate = data.rates[upperFrom];

    const realRate = rate / fromRate

    if (from === 'NGN' || from === 'ngn' || from === 'LRD' || from === "lrd") {
        const vape = realRate
        return { rate: 1 / vape, rawRate: vape };
    }

    // //console.log('realRate: ', realRate, 'from: ', from ,fromRate, 'to: ', isoCode, rate);

    // Return the rate if found, or a message if the currency is not available
    return { rate: realRate, rawRate: realRate }
};


export const xeRates = async (from: string, to: string) => {
    //console.log("Xe Rate started")
    try {
        const response = await axios.get(`https://www.xe.com/api/protected/midmarket-converter/`, {
            headers: {
                'Authorization': 'Basic bG9kZXN0YXI6cHVnc25heA==',
            }
        });
        const data = response.data;
        const ratings = getRateByCurrency(data, to, from);
        // //console.log('xeRates: ', ratings);
        return { name: 'Xe Exchange', rate: Number(ratings.rate), rawRate: Number(ratings.rawRate) };
    } catch (err: any) {
        // //console.error('Error fetching Afri Exchange rate:', err);
        return { msg: "error message", err }
    }
}


// Under Review``
const remitlyRate = async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://api.remitly.io/v3/calculator/estimate?conduit=USA%3AUSD-NGA%3ANGN&anchor=SEND&amount=&purpose=OTHER&customer_segment=UNRECOGNIZED&strict_promo=false`);
        const data = response.data.data;

        // //console.log('rately: ', data);
        return { name: 'Afri Exchange', rate: Number(data.exchangeRateToDisplay) };
    } catch (err: any) {
        // //console.error('Error fetching Afri Exchange rate:', err);
        return { msg: "error message", err }
    }
}

// End Here

function getRateD(response: any, toCurrency: any, fromCurrency: any) {
    const pair = response[fromCurrency]?.[toCurrency];

    if (!pair) {
        return null;
    }

    // Direct rate
    if (typeof pair === 'object') {
        return pair.buy; // Return buy rate for direct pair
    } else if (typeof pair === 'string') {
        // Reverse rate handling
        const [reverseFrom, reverseTo] = pair.split(':');
        const reversePair = response[reverseFrom]?.[reverseTo];

        if (!reversePair) {
            return null;
        }

        return reversePair.sell; // Return sell rate for reverse pair
    }

    return null;
}


const cadrRemitRate = async (from: string, to: string) => {
    //console.log('card reemit started');
    try {
        const response = await axios.get(`https://api.cadremit.com/v1/admin/settings`);
        const data = response.data.data;
        const rates = data.rates;
        // console.log(rates)

        // if (rates[from] && rates[from][to]) {
        //     const exchangeInfo = rates[from][to];

        //     // Handle the case where exchange information is stored as a string (e.g., "USD:CAD")
        //     if (typeof exchangeInfo === 'string') {
        //       return {
        //         // @ts-ignore
        //         name: 'CadrRemit Exchange', rate: Number(exchangeInfo.sell)
        //       };
        //     }

        //     // //console.log('CadrRemit Exchange: result: ',exchangeInfo.sell)

        //     // Return the "buy" and "sell" rates
        //     return {
        //         name: 'CadrRemit Exchange', rate: getRateD(rates, from, to),
        //     };
        //   } else {
        //     // Handle cases where the exchange rate does not exist
        //     return {
        //       error: `Exchange rate between ${from} and ${to} not found.`
        //     };
        //   }

        return { name: 'CadRemit Exchange', rate: getRateD(rates, from, to), rawRate: getRateD(rates, from, to) };
    } catch (err: any) {
        // //console.error('Error fetching CardRemit Exchange rate:', err);
        return { msg: "error message", err }
    }
}

// {
//     name: 'Xe Exchange',
//     rate: 0.06551546424270462,
//     rawRate: 0.06551546424270462
//   }

export const sendWaveRate = async (from: string, to: string) => {

    // console.log("wave started")

    try {
        // Find the "from" and "to" countries in the database
        const fromCountry = await ExchangeCountries.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('currency')), from.toLowerCase())
        });
        const toCountry = await ExchangeCountries.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('currency')), to.toLowerCase())
        });
        if (fromCountry && toCountry) {
            const response = await axios.get(`https://app.sendwave.com/v2/pricing-public?amountType=SEND&receiveCurrency=${to}&amount=1&sendCurrency=${from}&sendCountryIso2=${from === "USD" ? "us" : from === "GBP" ? "gb" : fromCountry.code.toLowerCase()}&receiveCountryIso2=${to === "USD" ? "us" : to === "GBP" ? "gb" : toCountry.code.toLowerCase()}`);
            const data = response.data;
            return {
                name: "Send Wave",
                rate: +data.baseExchangeRate,
                rawRate: +data.baseExchangeRate
            }
        }
        // const url = "https://app.sendwave.com/v2/pricing-public?amountType=SEND&receiveCurrency=NGN&amount=1&sendCurrency=USD&sendCountryIso2=us&receiveCountryIso2=ng"
        // const response = await axios.get(url);



    } catch (err: any) {
        // console.error('Error fetching Afri Exchange rate:', err);
        return { msg: "error message", err }
    }
}

const wiseRate = async (from: string, to: string) => {
    //console.log("Wise started")

    try {
        const response = await axios.get(`https://wise.com/rates/live?source=${from}&target=${to}&length=30&resolution=hourly&unit=day`);
        const data = response.data;
        const vape = Number(data.value)

        if (from === 'NGN' || from === 'ngn' || from === 'LRD' || from === "lrd") {
            return { name: 'Wise Exchange', rate: 1 / vape, rawRate: vape };
        }

        return { name: 'Wise Exchange', rate: Number(data.value), rawRate: vape };
    } catch (err: any) {
        // //console.error('Error fetching Afri Exchange rate:', err);
        return { msg: "error message", err }
    }
}


const transfergoRate = async (from: string, to: string) => {
    //console.log("Transfergo started")
    const Tfrom = from.toUpperCase();
    const Tto = to.toUpperCase();
    // console.log(`https://my.transfergo.com/api/fx-rates?from=${Tfrom}&to=${Tto}&amount=1`)
    try {
        // https://my.transfergo.com/api/fx-rates?from=NGN&to=GBP&amount=1000
        const response = await axios.get(`https://my.transfergo.com/api/fx-rates?from=${Tfrom}&to=${Tto}&amount=1000`);
        const data = response.data;
        const vape = Number(data.rate)

        if (from === 'NGN' || from === 'ngn' || from === 'LRD' || from === "lrd") {
            return { name: 'TransferGo Exchange', rate: 1 / vape, rawRate: vape };
        }

        return { name: 'TransferGo Exchange', rate: Number(data.rate), rawRate: vape };
    } catch (err: any) {
        // //console.error('Error fetching Afri Exchange rate:', err);
        // return { name: 'TransferGo Exchange', rate: 'N/A' }
        return { msg: "error message", err }
    }
}

const twelveDataRate = async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://api.twelvedata.com/exchange_rate?symbol=${from}/${to}&apikey=${process.env.TWELVEDATA_API_KEY}`);
        const data = response.data;
        return { name: 'twelveData Exchange', rate: Number(data.rate) };
    } catch (err: any) {
        // //console.error('Error fetching twelveData Exchange rate:', err);
        // return { name: 'twelveData Exchange', rate: 'N/A' }
        return { msg: "error message", err }
    }
}

const alphaVantageRate = async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
        const data = response.data;
        const treansferty = data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        return { name: 'alphaVantage Exchange', rate: Number(treansferty) };
    } catch (err: any) {
        // //console.error('Error fetching alphaVantage Exchange rate:', err);
        // return { name: 'alphaVantage Exchange', rate: 'N/A' }
        return { msg: "error message", err }
    }
}


const xchangeRtRate = async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${from}/${to}`);
        const data = response.data;
        return { name: 'xchangeRt Exchange', rate: Number(data.conversion_rate) };
    } catch (err: any) {
        // //console.error('Error fetching xchangeRtRate Exchange rate:', err);
        // return { name: 'xchangeRt Exchange', rate: 'N/A' }
        return { msg: "error message", err }
    }
}


const xchangeRtOrgRate = async (from: string, to: string) => {
    try {
        const response = await axios.get(`https://www.exchange-rates.org/api/v2/rates/lookup?isoTo=${to}&isoFrom=${from}&amount=1&pageCode=Home`);
        const data = response.data;
        return { name: 'Exchange-Rate Org Exchange', rate: Number(data.Rate) };
    } catch (err: any) {
        // //console.error('Error fetching xchangeRtRate Exchange rate:', err);
        // return { name: 'xchangeRt Exchange', rate: 'N/A' }
        return { msg: "error message", err }
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


const saveRawExchangeRate = async (pair: any, data: any) => {
    await RawExchangeRate.create({
        pair: pair,
        rates: data
    });
};
// const clearAllRawExchangeRates = async () => {
//     try {
//         await RawCurrencyPair.destroy({
//             where: {}, // No condition means all rows will be deleted
//             truncate: true // Optionally resets the auto-increment primary key
//         });
//         await RawExchangeRate.destroy({
//             where: {}, // No condition means all rows will be deleted
//             truncate: true // Optionally resets the auto-increment primary key
//         });
//         console.log("All raw exchange rates cleared successfully.");
//     } catch (error) {
//         console.error("Error clearing raw exchange rates:", error);
//     }
// };
const fetchExchangeRate = async (pair: string) => {
    const exchangeRate = await ExchangeRate.findOne({ where: { pair } });
    if (exchangeRate) {
        //console.log(exchangeRate.rates); // Will output the JSON with rates
    } else {
        //console.log("Rate not found for the pair:", pair);
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
//                 // // //console.error(`Error fetching rate for ${pair} from ${api.name}:`, err);
//                 results[pair][api.name] = null; // Return null if API fails
//             }
//         }
//         // await saveExchangeRate(pair, results[pair]);
//     }
//     // await saveExchangeRate(results);
//     await saveDatatoDb(results);
//     return results;
// };






interface CurrencyRate {
    id: number;
    currency_name: string;
    currency_rate: string; // "900 / 940"
    currency_type: string;
    currency_flag: string;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    response: Record<string, CurrencyRate[]>;
}

// Utility to parse rates
const removeAsterisks = (str: string): string => {
    return str.replace(/\*/g, '');
};

const parseCurrencyRate = (rate: string): { buy: number; sell: number } => {
    const cleanedRate = removeAsterisks(rate); // Remove asterisks
    const [buy, sell] = cleanedRate.split(' / ').map(Number);
    return { buy, sell };
};

// Function to fetch and search for currency rates
const getCurrencyRate = async (gofrom: string, goto: string): Promise<number | null> => {
    const from = gofrom.toUpperCase();
    const to = goto.toUpperCase();
    try {

        if (from !== 'NGN' && to !== 'NGN') {
            return null;
        }

        const otherCurrency = from === 'NGN' ? to : from;
        const apiUrl = isStringInArray(otherCurrency, abokiDefault)
            ? 'https://abokifx.com/api/v1/rates/movement'
            : 'https://abokifx.com/api/v1/rates/otherparallel';

        const { data } = await axios.get<ApiResponse>(apiUrl, {
            headers: {
                Authorization: 'Bearer 71f79dea7dec238e0f90a5dc390084267ebd40c2'
            }
        }); // Replace with your API URL

        const responseEntries = Object.entries(data.response);
        for (const [, rates] of responseEntries) {
            const targetRate = rates.find((rate) => rate.currency_name === (from === 'NGN' ? to : from));

            if (targetRate) {
                const { buy, sell } = parseCurrencyRate(targetRate.currency_rate);

                // Logic: If converting to NGN, return buy rate; if converting from NGN, return sell rate
                if (from === 'NGN') {
                    return sell; // NGN to other currency (sell rate)
                } else if (to === 'NGN') {
                    return buy; // Other currency to NGN (buy rate)
                }
            }
        }

        //console.error(`Rate for ${from} to ${to} not found`);
        return null;
    } catch (error) {
        //console.error('Error fetching data:', error);
        return null;
    }
};

// // Usage
// (async () => {
//   const rateToNGN = await getCurrencyRate('usd', 'NGN'); // AUD -> NGN (buy rate)
//   //console.log(`AUD to NGN: ${rateToNGN}`); // Should return 900

//   const rateFromNGN = await getCurrencyRate('NGN', 'USD'); // NGN -> AUD (sell rate)
//   //console.log(`NGN to AUD: ${rateFromNGN}`); // Should return 940
// })();






// export const pairs = [
//     'CAD/NGN',
//     'NGN/CAD'
// ];

export const pairs = [
    'GHS/EUR', 'GHS/CAD', 'GHS/USD', 'GHS/GBP',
    'EUR/GHS', 'CAD/GHS', 'USD/GHS', 'GBP/GHS',
    'GBP/GMD', 'GMD/GBP',
    'GMD/CAD', 'GMD/EUR', 'CAD/USD', 'CAD/EUR',
    'CAD/GBP', 'EUR/USD', 'EUR/CAD', 'EUR/GBP',
    'GBP/USD', 'GBP/CAD', 'GBP/EUR',
    'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN',
    'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD',
    'GHS/NGN', 'AED/NGN', 'SLL/NGN', 'RWF/NGN',
    'GHS/LRD', 'AED/LRD', 'SLL/LRD', 'RWF/LRD',
    'NGN/USD', 'NGN/EUR', 'NGN/GBP', 'NGN/CAD',
    'LRD/USD', 'LRD/EUR', 'LRD/GBP', 'LRD/CAD',
    'NGN/GHS', 'NGN/AED', 'NGN/SLL', 'NGN/RWF',
    'LRD/GHS', 'LRD/AED', 'LRD/SLL', 'LRD/RWF',
    'USD/KES', 'EUR/KES', 'GBP/KES', 'CAD/KES',
    'USD/ZMW', 'EUR/ZMW', 'GBP/ZMW', 'CAD/ZMW',
    'USD/TZS', 'EUR/TZS', 'GBP/TZS', 'CAD/TZS',
    'USD/XOF', 'EUR/XOF', 'GBP/XOF', 'CAD/XOF',
    'USD/XAF', 'EUR/XAF', 'GBP/XAF', 'CAD/XAF',
    'KES/USD', 'KES/EUR', 'KES/GBP', 'KES/CAD',
    'ZMW/USD', 'ZMW/EUR', 'ZMW/GBP', 'ZMW/CAD',
    'TZS/USD', 'TZS/EUR', 'TZS/GBP', 'TZS/CAD',
    'XOF/USD', 'XOF/EUR', 'XOF/GBP', 'XOF/CAD',
    'XAF/USD', 'XAF/EUR', 'XAF/GBP', 'XAF/CAD',
    'KES/ZMW', 'KES/TZS', 'KES/XOF', 'KES/XAF',
    'ZMW/TZS', 'ZMW/XOF', 'ZMW/XAF', 'USD/CAD',
    'TZS/XOF', 'TZS/XAF', 'USD/GBP', 'USD/EUR',
    'XOF/XAF', 'USD/SLL', 'SLL/NGN', 'SLL/LRD',
    'NGN/SLL', 'CAD/GMD', 'EUR/GMD', 'USD/GMD',
    'CAD/SLL', 'GBP/SLL', 'EUR/SLL', 'GMD/USD',

];
export const handleAllFetch = async () => {
    console.log("all fetches runing ========>")



    // const pairs = [
    //     'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN',
    //     'USD/LRD', 'EUR/LRD',
    //     'NGN/USD', 'NGN/EUR', 'NGN/GBP', 'NGN/CAD',
    // ];


    // [
    //     'NGN/USD', 'NGN/EUR', 'NGN/GBP', 'NGN/CAD',
    //     'LRD/USD', 'LRD/EUR', 'LRD/GBP', 'LRD/CAD',
    //     'NGN/GHS', 'NGN/AED', 'NGN/SLL', 'NGN/RWF',
    //     'LRD/GHS', 'LRD/AED', 'LRD/SLL', 'LRD/RWF'
    //   ]

    // const pairs = [
    //     'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN',
    //     'NGN/USD', 'NGN/EUR', 'NGN/GBP', 'NGN/CAD',
    //     // 'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD'
    // ];
    const apis = [sendWaveRate, afriXchangeRate, wiseRate, transfergoRate, xeRates, abokifxng, cadrRemitRate, lemfiRate];
    const excludedNames = ['abokifxng', 'cadrRemitRate', "Twelve Data Exchange", "Alphatvantage Exchange", "xchangeRt exchange"];
    // const apis = [sendWaveRate, cadrRemitRate];


    const results: Record<string, Record<string, number | null>> = {};
    const rawResults: Record<string, Record<string, number | null>> = {};

    for (const pair of pairs) {
        const [from, to] = pair.split('/');
        results[pair] = {};
        rawResults[pair] = {};

        for (const api of apis) {
            try {
                const rateData = await api(from, to);
                // console.log(rateData, "rateIino")
                if (rateData && rateData.rate !== undefined && rateData.rawRate !== undefined) {

                    // Only add to `rawResults` if not excluded
                    // @ts-ignore
                    if (!excludedNames.includes(rateData.name)) {
                        // @ts-ignore
                        results[pair][rateData.name] = rateData.rate.toFixed(2);
                        // @ts-ignore
                        rawResults[pair][rateData.name] = rateData.rawRate;
                    }

                } else {

                    // @ts-ignore
                    if (!excludedNames.includes(rateData.name)) {
                        // @ts-ignore
                        results[pair][rateData.name] = null;
                        // @ts-ignore
                        rawResults[pair][rateData.name] = null;
                    }

                }
            } catch (err: any) {
                results[pair][api.name] = null;
                if (!excludedNames.includes(api.name)) {
                    rawResults[pair][api.name] = null;
                }

            }
        }
        const stats = calculateStats({ [pair]: results[pair] });
        const rawStats = calculateStats({ [pair]: rawResults[pair] });


        const pairData = {
            currencyPair: pair,
            exchangeRate: stats[pair].mean
        }
        const rawPairData = {
            currencyPair: pair,
            exchangeRate: rawStats[pair].mean
        }
        results[pair]["BanffPay Rate"] = stats[pair].mean;
        console.log(pairData, "raw-pair", results[pair])
        // console.log(results[pair], "raw-pair-result")

        // console.log(rawPairData,"paidata", rawResults[pair], "raw-results")
        await createCurrencyPair(pairData);
        await createRawCurrencyPair(rawPairData);

        await saveExchangeRate(pair, results[pair]);
        await saveRawExchangeRate(pair, rawResults[pair]);
        // await clearAllRawExchangeRates()
        autoUpdateInternalRatesOnFetch(pair, results[pair]);


    }

    // await saveDatatoDb(results);
    // await saveRawDatatoDb(rawResults);

    return results;
};


export const saveDatatoDb = async (data: any) => {
    try {
        for (const pair in data) {
            await saveExchangeRate(pair, data[pair]);
        }
        return { msg: 'Data saved' }
    } catch (error: any) {
        //console.log(error);
        return { error: "Error saving data" }
    }
}
export const saveRawDatatoDb = async (data: any) => {
    try {
        for (const pair in data) {
            await saveRawExchangeRate(pair, data[pair]);
        }
        return { msg: 'Data saved' }
    } catch (error: any) {
        //console.log(error);
        return { error: "Error saving data" }
    }
}


export const getSingleRateFromDBPairs = async (pair: string) => {
    try {
        const exchangeRate = await ExchangeRate.findOne({ where: { pair }, order: [['createdAt', 'DESC']] });

        if (!exchangeRate) {
            throw new Error(`Exchange rate for pair ${pair} not found`);
        }

        return exchangeRate;
    } catch (error: any) {
        throw new Error(`Failed to fetch exchange rate: ${error.message}`);
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
export const getRawRatesFromDBPairs = async (pair: string) => {
    try {
        const exchangeRate = await RawExchangeRate.findAll({ where: { pair } });

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

// export const getPyData = async () => {
//     try {

//     } catch (error: any) {

//     }
// }
export const removeRateKeyForAllPairs = async (keyToRemove: string) => {
    try {
        // Fetch all exchange rates
        const exchangeRates = await ExchangeRate.findAll();

        for (const exchangeRate of exchangeRates) {
            if (exchangeRate.rates && keyToRemove in exchangeRate.rates) {
                // Clone the rates object
                const updatedRates = { ...exchangeRate.rates };
                delete updatedRates[keyToRemove]; // Remove the specified key

                // Update the record
                exchangeRate.rates = updatedRates;
                await exchangeRate.save();
            }
        }

        console.log(`Key "${keyToRemove}" removed from rates for all pairs.`);
    } catch (error) {
        console.error("Error removing key from rates for all pairs:", error);
        throw error;
    }
};
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
export const getRatesFromDBWithDateFilter = async (startDate?: string, endDate?: string) => {
    try {
        const whereClause: any = {};

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Fetch all exchange rates with raw data
        const exchangeRates = await ExchangeRate.findAll({
            raw: true,
            attributes: ['id', 'pair', 'rates', 'createdAt', 'updatedAt'],
            where: whereClause,
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
export const getRawRatesFromDB = async () => {

    try {
        // Fetch all exchange rates with raw data
        const exchangeRates = await RawExchangeRate.findAll({
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
    let latestRates: Record<string, any> = {};
    // Query for matching currency pairs within the given date range
    const rates = await ExchangeRate.findAll({
        where: { pair: currency },
        limit: 1,
        order: [['createdAt', 'DESC']]
    });

    const currency_split = currency.split('/');

    const groupedRecords: Record<string, any> = {};
    rates.forEach(record => {
        if (!groupedRecords[record.pair]) {
            groupedRecords[record.pair] = record.rates; // store the rates field (which is a JSON object)
        }
    });

    // Fetch additional rates for the currency pair
    const additionalRates = await getAdditionalRatesId(currency_split[0].toUpperCase(), currency_split[1].toUpperCase());

    // Combine the rates and append the additional rates
    const allRates = { ...groupedRecords };

    additionalRates.forEach((additionalRate: any) => {
        const pairKey = `${additionalRate.from_currency}/${additionalRate.to_currency}`;
        if (!allRates[pairKey]) {
            allRates[pairKey] = {}; // Create an empty object if not already present
        }

        // Add the additional rate under the appropriate vendor name (e.g., "bnb Exchange")
        const vendorName = `${additionalRate.vendor} Exchange`;
        allRates[pairKey][vendorName] = parseFloat(additionalRate.rate); // Ensure the rate is a number
    });

    // Log the final rates after combining
    // await ExchangeRate.findAll({
    //     where: {
    //         pair: { [Op.like]: `%${currency}%` },
    //         createdAt: {
    //             [Op.between]: [new Date(startDate), new Date(endDate)]
    //         }
    //     },
    //     order: [['createdAt', 'ASC']]  // Sort by date ascending
    // });


    // Extract rates from results
    // const rateValues = rates.map((rate: any) => rate.rates[currency] || 0);

    // const rateVendorPairs = rates.flatMap((rate: any) => {
    //     return Object.entries(rate.rates).filter(([vendor, rateValue]) => {
    //         return rateValue !== null && rateValue !== 0;
    //     }).map(([vendor, rateValue]) => ({
    //         vendor,
    //         rate: rateValue as number
    //     }));
    // });

    const rateVendorPairs = Object.entries(allRates).flatMap(([pair, vendors]) => {
        // For each pair (e.g., 'CAD/NGN'), filter the vendors to get only valid rates
        return Object.entries(vendors).filter(([vendor, rateValue]) => {
            return rateValue !== null && rateValue !== 0 && vendor !== "BanffPay Rate"; // Filter out invalid rates
        }).map(([vendor, rateValue]) => ({
            pair, // Add the currency pair as part of the result
            vendor,
            rate: rateValue as number
        }));
    });


    // console.log("Updated Rates: ", rateVendorPairs);

    type VendorRate = {
        vendor: string;
        rate: number;
    };


    function getTopAndBottomRatesWithAverages(rates: VendorRate[]): {
        top3: VendorRate[],
        bottom3: VendorRate[],
        top3Avg: number,
        bottom3Avg: number,
        minAvg: number,
        maxRate: number;
    } {
        // Sort rates in ascending order by rate and remove duplicates
        const sortedRates = rates.slice().sort((a, b) => a.rate - b.rate);
        const uniqueRates = sortedRates.filter((item, index, arr) =>
            index === 0 || item.rate !== arr[index - 1].rate
        );

        // Get the bottom 3 (smallest rates) and top 3 (largest rates)
        const bottom3 = uniqueRates.slice(0, 3);
        const top3 = uniqueRates.slice(-3).reverse(); // Get last 3 and reverse for descending order
        // Helper function to calculate average
        const calculateAverage = (items: VendorRate[]): number => {
            // @ts-ignore
            return items.reduce((sum, item) => sum + parseFloat(item.rate), 0) / items.length;
        };
        // Calculate averages
        const top3Avg = calculateAverage(top3);
        const bottom3Avg = calculateAverage(bottom3);
        const minAvg = (top3Avg + bottom3Avg) / 2
        const maxRate = Math.max(...top3.map((vendRate) => vendRate.rate))

        return { top3, bottom3, top3Avg, bottom3Avg, minAvg, maxRate };
    }

    // //console.log(getTopAndBottomRatesWithAverages(rateVendorPairs))

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

    // //console.log("Lowest five rates:", lowestFiveRates);
    // //console.log("Highest five rates:", highestFiveRates);

    // // Sort rates from lowest to highest
    // rateValues.sort((a: number, b: number) => a - b);

    // // Get top 5 highest rates
    // const top5Rates = rateValues.slice(-5);
    // const top5Avg = top5Rates.reduce((acc, rate) => acc + rate, 0) / top5Rates.length;

    // // Get bottom 5 lowest rates
    // const bottom5Rates = rateValues.slice(0, 5);
    // const bottom5Avg = bottom5Rates.reduce((acc, rate) => acc + rate, 0) / bottom5Rates.length;

    const answer = getTopAndBottomRatesWithAverages(rateVendorPairs);
    const banffPayRate = await getCurrencyPairByPair(currency)
    const internalRate = await getInternalRateByPair(currency)
    const inverse = await getInternalRateByPair(inversePair(currency))
    //    const anffP  const recentRates = await CurrencyPair.findAll({
    //     // @ts-ignore
    //     where: { currencyPair: pair },
    //     limit: 4,
    //     order: [['createdAt', 'DESC']]
    // });
    if (inverse) {
        return { ...answer, banffPayRate: inverse?.sell_rate };
    }
    if (internalRate) {
        return { ...answer, banffPayRate: internalRate?.buy_rate };

    } else {
        return { ...answer, banffPayRate: answer?.maxRate.toFixed(2) };

    }

    // lows: lowestFiveRates,
    // highs: highestFiveRates,
    // lowAvg: calculateAverage(lowestFiveRates),
    // highAvg: calculateAverage(highestFiveRates),
    // Avgrate: calculateAverage([calculateAverage(lowestFiveRates), calculateAverage(highestFiveRates)]);
};


export const analysisReVamp = async (currency: string) => {
    const recentRate = await ExchangeRate.findAll({
        where: { pair: currency },
        limit: 1,
        order: [['createdAt', 'DESC']]
    })

    return recentRate;
}


export const sendRate = async () => {
    try {
        const mailList = ["dharold@bpay.africa", "mlawal@bpay.africa", "eamrovhe@bpay.africa", "osaliu@banffpay.com", "mebitanmi@banffpay.com", "eakinlua@bpay.africa", "cidefoh@banffpay.com"]
        // const mailList = ["dharold@bpay.africa"]
        const currencies = ["USD", "CAD", "GBP", "EUR", "NGN", "GHS", "XAF", "XOF", "SLL", "LRD", "GMD", "KES", "ZMW", "TZS"];
        const pairsCombo = currencies.flatMap(from => currencies.map(to => `${from}/${to}`));
        const pairs = await getAllCurrencyPairs();
        // console.log(pairs)

        // const currencies = [...new Set(pairs.map(pair => pair.currencyPair.split("/")).flat())];

        const exchangeRates: { [key: string]: { [key: string]: number } } = {};
        pairs.forEach(pair => {
            const [from, to] = pair.currencyPair.split("/");
            if (!exchangeRates[from]) exchangeRates[from] = {};
            exchangeRates[from][to] = pair.exchangeRate;
        });
        const tableRows = currencies.map(rowCurrency => `
            <tr>
                <td style="background-color: #4CAF50; color: white;">${rowCurrency}</td>
                ${currencies.map(colCurrency => {
            const rate = rowCurrency === colCurrency ? 1 : exchangeRates[rowCurrency]?.[colCurrency] || '';
            const bgColor = rowCurrency === colCurrency ? '#FFFF00' : ''; // Highlight diagonal cells in yellow
            return `<td style="background-color: ${bgColor}; text-align: center;">${typeof rate === 'number' ? rate.toFixed(2) : rate}</td>`;
        }).join('')}
            </tr>
        `).join('');
        const mailOptions = {
            from: `Exchange@bpay.africa`,
            to: mailList,
            subject: "BanffPay Exchange Rate Update",
            html: `
                <h1>Exchange Rate Update</h1>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th style="background-color: #4CAF50; color: white;">&nbsp;</th>
                            ${currencies.map(currency => `
                                <th style="background-color: #4CAF50; color: white;">${currency}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <p>Best Regards,</p>
            `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("email sent")
    } catch (error) {
        console.log(error)

    }

}



