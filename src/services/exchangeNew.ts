// services/exchangeRateService.ts

import ExchangeRate from "../models/ExchangeRate"; // Adjust the import path
import { Op } from "sequelize";
import { getAdditionalRates } from "./currencyPairService";

const pairs = [
    'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN',
    'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD',
    'GHS/NGN', 'AED/NGN', 'SLL/NGN', 'RWF/NGN',
    'GHS/LRD', 'AED/LRD', 'SLL/LRD', 'RWF/LRD',
    'NGN/USD', 'NGN/EUR', 'NGN/GBP', 'NGN/CAD',
    'LRD/USD', 'LRD/EUR', 'LRD/GBP', 'LRD/CAD',
    'NGN/GHS', 'NGN/AED', 'NGN/SLL', 'NGN/RWF',
    'LRD/GHS', 'LRD/AED', 'LRD/SLL', 'LRD/RWF',
];

export const fetchLatestExchangeRates = async () => {
    try {
        const latestRates: Record<string, any> = {};

        // Fetch the latest records for all specified pairs
        const records = await ExchangeRate.findAll({
            where: {
                pair: {
                    [Op.in]: pairs
                }
            },
            order: [['createdAt', 'DESC']],
            limit: pairs.length // Limit to the number of unique pairs
        });

        // Group the records by pair
        const groupedRecords: Record<string, any> = {};
        records.forEach(record => {
            if (!groupedRecords[record.pair]) {
                groupedRecords[record.pair] = record;
            }
        });

        const additionalRates = await getAdditionalRates();

        // Process each pair
        pairs.forEach(pair => {
            const record = groupedRecords[pair];
            latestRates[pair] = record ? record.rates : {};
            additionalRates[0]
            // @ts-ignore
            .filter(rate => `${rate.from_currency}/${rate.to_currency}` === pair)
             // @ts-ignore
            .forEach(rate => {
            latestRates[pair][`${rate.vendor} Exchange`] = parseFloat(rate.rate);
            });
        });

        return latestRates;
    } catch (error) {
        console.error("Error fetching latest exchange rates:", error);
        throw new Error("Internal Server Error");
    }
};

// export default {
//     fetchLatestExchangeRates
// };