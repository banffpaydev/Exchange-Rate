import { Request, Response } from 'express';
import { createCurrencyPair, getAllCurrencyPairs, getCurrencyPairById, updateCurrencyPair, deleteCurrencyPair, getPaginatedCurrencyPairs, getCurrencyPairByPair } from '../services/currencyPairService';
import CurrencyPair from '../models/CurrencyPair';
import RawCurrencyPair from '../models/RawCurrencyPair';
import { getSourceAndDesCountries, updateSellRate } from '../services/rateService';
import { calculateBanffPayBuySellRate, inversePair } from './treps';
import { getRatesFromDBPairs, getSingleRateFromDBPairs } from '../services/ExchangeRateService';
import { getAllDBInternalRates, getInternalRateByPair, saveInternalRate, saveMultipleInternalRates, updateInternalRateByPair } from '../services/internalRateService';
import { InternalRateAttributes } from '../models/internalRate';

export const createPair = async (req: Request, res: Response) => {
    try {
        const newPair = await createCurrencyPair(req.body);
        res.status(201).json(newPair);
    } catch (error) {
        res.status(500).json({ message: 'Error creating currency pair', error });
    }
};
export const getPaginatedPairs = async (req: Request, res: Response) => {
    const { limit, page } = req.query;
    try {
        const pairs = await getPaginatedCurrencyPairs(Number(page) || 1, Number(limit) || 10);
        res.status(200).json(pairs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pairs', error });
    }
};
export const getPairs = async (req: Request, res: Response) => {

    try {
        const pairs = await getAllCurrencyPairs();
        res.status(200).json(pairs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pairs', error });
    }
};

// export const calculateInternalRates = async (req: any, res: Response) => {
//     // const { type } = req.user
//     // if (type !== "admin") {
//     //     res.status(401).json({ message: 'Forbidden' });
//     // }

//     const { pair, inverse_vendors_considered, buy_adder, sell_reduct } = req.body
//     if (!pair) {
//         res.status(400).json({ message: 'Currency Pair is required' });
//         return
//     }
//     if (!inverse_vendors_considered || inverse_vendors_considered.length < 1) {
//         res.status(400).json({ message: 'Inverse vendor is required' });
//         return
//     }
//     const invertedPair = inversePair(pair);
//     try {
//         const specialPairs = [
//             {
//                 mainPair: { pair: pair, included: ["Send Wave", "Wise Exchange", "Xe Exchange", "CadRemit Exchange", "Abokifx", "Afri Exchange", "TransferGo Exchange"] },
//                 // inversePair: { pair: "NGN/CAD", included: ["CadRemit Exchange", "Abokifx", "Lemfi"] },
//                 inversePair: { pair: invertedPair, included: [...inverse_vendors_considered] },

//             },
//             // Add more pairs as needed
//         ];

//         // Create an array to store the results
//         const results = [];

//         for (const { mainPair, inversePair } of specialPairs) {
//             // Fetch buy rates for the main pair
//             const buyData = await getSingleRateFromDBPairs(mainPair.pair);
//             // console.log(buyData)
//             if (buyData) {
//                 // Filter specific key-value pairs for buy rates
//                 // const filteredBuyRates = Object.fromEntries(
//                 //     Object.entries(buyData.rates).filter(
//                 //         ([key, value]) => mainPair.included.includes(key) && value !== null && value > 0
//                 //     )
//                 // );
//                 const filteredBuyRates = Object.fromEntries(
//                     Object.entries(buyData.rates).filter(
//                         ([key, value]) => value !== null && value > 0
//                     )
//                 );
//                 // console.log(filteredBuyRates, "filtBuy")
//                 const buyValues = Object.values(filteredBuyRates).map(value => Number(value));

//                 // Fetch sell rates for the inverse pair
//                 const sellData = await getSingleRateFromDBPairs(inversePair.pair);
//                 // console.log(sellData)


//                 if (sellData) {
//                     // Filter specific key-value pairs for sell rates
//                     const filteredSellRates = Object.fromEntries(
//                         Object.entries(sellData.rates).filter(
//                             ([key, value]) => inversePair.included.includes(key) && value !== null && value > 0
//                         )
//                     );
//                     // console.log(filteredSellRates, "filtSell")

//                     const sellValues = Object.values(filteredSellRates).map(value => Number(value));
//                     // Perform calculations for only one mainPair as buy and inversePair as sell
//                     const result = calculateBanffPayBuySellRate(buyValues, sellValues, buy_adder, sell_reduct);

//                     // Store the result with pair information
//                     results.push({
//                         mainPair: mainPair.pair,
//                         sellPair: inversePair.pair,
//                         result: result
//                     });
//                 }
//             }
//         }

//         // Log or return the collected results
//         console.log("All results:", results);
//         saveInternalRate({ bpay_buy_adder: results.})
//         res.status(200).json(results);

//         // return results; // You can return the results for further use

//     } catch (error) {
//         console.error("Error fetching internal rates:", error);
//     }
// };

export const getDbRateByPair = async (req: Request, res: Response) => {
    const { pair } = req.query
    try {
        if (!pair) {
            res.status(400).json({ message: 'Pair is required' });

        }
        const data = await getSingleRateFromDBPairs(pair as string);
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: 'An error occurred while processing the request' });

    }
}
export const calculateMulipleInternalRates = async (req: any, res: Response) => {
    const { pairs } = req.body;

    if (!pairs || pairs.length === 0) {
        res.status(400).json({ message: 'Currency pairs and configurations are required' });
        return;
    }

    try {
        // Create an array to store results
        const results = [];

        for (const { pair, inverse_vendors_considered, buy_adder, sell_reduct } of pairs) {
            if (!pair || !inverse_vendors_considered || inverse_vendors_considered.length === 0) {
                continue; // Skip invalid entries
            }

            const invertedPair = inversePair(pair);

            // Fetch buy rates for the main pair
            const buyData = await getSingleRateFromDBPairs(pair);

            if (buyData) {
                const filteredBuyRates = Object.fromEntries(
                    Object.entries(buyData.rates).filter(
                        ([key, value]) => value !== null && value > 0
                    )
                );
                const buyValues = Object.values(filteredBuyRates).map(value => Number(value));
                // Fetch sell rates for the inverse pair
                const sellData = await getSingleRateFromDBPairs(invertedPair);

                if (sellData) {
                    const filteredSellRates = Object.fromEntries(
                        Object.entries(sellData.rates).filter(
                            ([key, value]) => inverse_vendors_considered.includes(key) && value !== null && value > 0
                        )
                    );
                    const sellValues = Object.values(filteredSellRates).map(value => Number(value));
                    // Perform calculation
                    const result = calculateBanffPayBuySellRate(buyValues, sellValues, +buy_adder, +sell_reduct);

                    // Add result to the array
                    results.push({
                        mainPair: pair,
                        sellPair: invertedPair,
                        result: result,
                        filteredBuyRates,
                        filteredSellRates
                    });
                }
            }
        }
        const formattedResult = results.map((result) => {
            return {
                pair: result.mainPair,
                bpay_buy_adder: result.result?.bpay_buy_adder ?? 0.2,
                bpay_sell_reduct: result.result?.bpay_sell_reduct ?? 0.2,
                buy_rate: result.result?.bpay_buy_rate ?? 0,
                sell_rate: result.result?.bpay_sell_rate ?? 0,
                buy_rate_source: result.result?.buy_Rate_Source ?? 0,
                sell_rate_source: result.result?.sell_Rate_Source ?? 0,
                buy_exchanges_considered: result.filteredBuyRates,
                sell_exchanges_considered: result.filteredSellRates
            }
        })
        await saveMultipleInternalRates(formattedResult);

        // Return all results
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching internal rates:", error);
        res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};

export const getAllInternalRates = async (req: Request, res: Response) => {
    try {
        const rates = await getAllDBInternalRates();
        res.status(200).json(rates);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pair', error });
    }
};

export const getSingleInternalRates = async (req: Request, res: Response) => {
    const { pair } = req.query
    if (!pair) {
        res.status(400).json({ message: 'Pair is required' });
    }
    try {
        const pairData = await getInternalRateByPair(pair as string);
        if (pairData) {
            res.status(200).json(pairData);
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pair', error });
    }
};

export const updateInternalRates = async (req: any, res: Response) => {
    const { pair,
        buy_rate,
        sell_rate,
        buy_rate_source,
        sell_rate_source,
        bpay_buy_adder,
        bpay_sell_reduct,
        buy_exchanges_considered,
        sell_exchanges_considered,
    } = req.body;

    // if (!pairs || pairs.length === 0) {
    //     res.status(400).json({ message: 'Currency pairs and configurations are required' });
    //     return;
    // }

    try {
        // Create an array to store results
        const data = updateInternalRateByPair({
            pair,
            buy_rate,
            sell_rate,
            buy_rate_source,
            sell_rate_source,
            bpay_buy_adder,
            bpay_sell_reduct,
            buy_exchanges_considered,
            sell_exchanges_considered,
        })
        res.status(200).json({ message: "Success", data: data });
    } catch (error) {
        console.error("Error fetching internal rates:", error);
        res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};
export const getPairById = async (req: Request, res: Response) => {
    try {
        const pair = await getCurrencyPairById(Number(req.params.id));
        if (pair) {
            res.status(200).json(pair);
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pair', error });
    }
};
export const getRemitOneSourceandDest = async (req: Request, res: Response) => {
    try {
        const sourceAndDesCountries = await getSourceAndDesCountries();

        res.status(200).json(sourceAndDesCountries);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pair', error });
    }
};

export const updatePair = async (req: any, res: Response) => {
    if (req.user?.type !== "admin") {
        res.status(401).json({ message: 'Forbidden', });

    }
    try {

        // Fetch source and destination countries from the cache or API
        const sourceAndDesCountries = await getSourceAndDesCountries();
        const findSourceCountry = sourceAndDesCountries.source.find((country) => country.currency === req.body.from)
        const findDestCountry = sourceAndDesCountries.destination.find((country) => country.currency === req.body.to)

        if (findSourceCountry && findDestCountry) {
            const response = await updateSellRate(findSourceCountry?.id, findSourceCountry?.currency, findDestCountry?.id, findDestCountry?.currency, +req.body.exchangeRate)
        }
        const updatedPair = await updateCurrencyPair(Number(req.params.id), req.body);
        if (updatedPair) {
            res.status(200).json(updatedPair);
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating currency pair' });
    }
};

export const deletePair = async (req: Request, res: Response) => {
    try {
        const deleted = await deleteCurrencyPair(Number(req.params.id));
        if (deleted) {
            res.status(200).json({ message: 'Currency pair deleted successfully' });
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting currency pair', error });
    }
};

export const getRecentRates = async (req: Request, res: Response) => {
    const { pair } = req.query;

    try {
        // Find recent 4 rates including current one
        const recentRates = await CurrencyPair.findAll({
            // @ts-ignore
            where: { currencyPair: pair },
            limit: 4,
            order: [['createdAt', 'DESC']]
        });

        if (recentRates.length === 0) {
            return res.status(404).json({ message: 'No rates found for this currency pair' });
        }

        // Format the response
        const currentRate = recentRates[0].exchangeRate;
        const previousRates = recentRates.slice(1).map((rate) => ({
            date: rate.createdAt,
            rate: rate.exchangeRate,
        }));

        res.status(200).json({
            pair,
            rate: currentRate,
            previous: previousRates
        });
    } catch (error: any) {
        // Log and handle any errors
        res.status(500).json({ message: 'Error fetching recent rates', error: error.message });
    }
};

export const getRecentRawRates = async (req: Request, res: Response) => {
    const { pair } = req.query;

    try {
        // Find recent 4 rates including current one
        const recentRates = await RawCurrencyPair.findAll({
            // @ts-ignore
            where: { currencyPair: pair },
            limit: 4,
            order: [['createdAt', 'DESC']]
        });

        if (recentRates.length === 0) {
            return res.status(404).json({ message: 'No rates found for this currency pair' });
        }

        // Format the response
        const currentRate = recentRates[0].exchangeRate;
        const previousRates = recentRates.slice(1).map((rate) => ({
            date: rate.createdAt,
            rate: rate.exchangeRate,
        }));

        res.status(200).json({
            pair,
            rate: currentRate,
            previous: previousRates
        });
    } catch (error: any) {
        // Log and handle any errors
        res.status(500).json({ message: 'Error fetching recent rates', error: error.message });
    }
};
