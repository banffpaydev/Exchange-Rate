import axios from "axios";
import dotenv from 'dotenv';
import ExchangeRate from "../models/ExchangeRate";
import { getRepository } from "typeorm";

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
        const response = await axios.get(`https://client.africhange.com/api/Rate?sendingCurrencyCode=${from}&receivingCurrencyCode=${to}`);
        const data = response.data.data;
        console.log('afriXChange: ', data);
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
export const handleAllFetch = async () => {
    const pairs = ['USD/AOA', 'USD/GHS', 'USD/CAD', 'USD/NGN', 'USD/SLL', 'USD/XOF', 'USD/GBP', 'USD/EUR', 'USD/CNY'];
    const apis = [lemfiRate, afriXchangeRate, wiseRate, transfergoRate, twelveDataRate, alphaVantageRate, xchangeRtRate, xeRates];
    
    const results: Record<string, Record<string, number | null>> = {};

    // Iterate over each currency pair
    for (const pair of pairs) {
        const [from, to] = pair.split('/');
        
        results[pair] = {};

        // Iterate over each API and fetch rates
        for (const api of apis) {
            try {
                const rateData = await api(from, to);

                // Ensure rate is present, otherwise return null
                if (rateData && rateData.rate !== undefined) {
                    results[pair][rateData.name] = rateData.rate;

                } else {
                    // @ts-ignore
                    results[pair][rateData.name] = null; // Return null for missing rate
                }

            } catch (err: any) {
                // // console.error(`Error fetching rate for ${pair} from ${api.name}:`, err);
                results[pair][api.name] = null; // Return null if API fails
            }
        }
        // await saveExchangeRate(pair, results[pair]);
    }
    // await saveExchangeRate(results);
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
        const exchangeRate = await ExchangeRate.findOne({ where: { pair } });

        if (!exchangeRate) {
            throw new Error(`Exchange rate for pair ${pair} not found`);
        }

        return exchangeRate;
    } catch (error: any) {
        throw new Error(`Failed to fetch exchange rate: ${error.message}`);
    }
}


export const getRatesFromDB = async () => {
    try {
        const exchangeRate = await ExchangeRate.findAll({ raw: true });

        if (!exchangeRate) {
            throw new Error(`Exchange rates not found`);
        }

        return exchangeRate;
    } catch (error: any) {
        throw new Error(`Failed to fetch exchange rate: ${error.message}`);
    }
}






