// services/exchangeRateService.ts

import ExchangeRate from "../models/ExchangeRate"; // Adjust the import path
import { Op } from "sequelize";
import {
  getAdditionalRates,
  getSingleCurrencyPair,
} from "./currencyPairService";
import {
  buyPairs,
  getTopAndBottomRatesWithAverages,
  pairs,
} from "./ExchangeRateService";
import { inversePair } from "../controllers/treps";
import { getInternalRateByPair } from "./internalRateService";

export const fetchLatestExchangeRates = async () => {
  try {
    const latestRates: Record<string, any> = {};

    // Fetch the latest records for all specified pairs
    const records = await ExchangeRate.findAll({
      where: {
        pair: {
          [Op.in]: pairs,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: pairs.length, // Limit to the number of unique pairs
    });

    // Group the records by pair
    const groupedRecords: Record<string, any> = {};
    records.forEach((record) => {
      if (!groupedRecords[record.pair]) {
        groupedRecords[record.pair] = record.rates;
      }
    });

    const additionalRates = await getAdditionalRates();
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
   
    // Process each pair
    for (const pair of pairs) {
      const record = groupedRecords[pair];
      latestRates[pair] = record ? record : {};

      const internalRate = await getSingleCurrencyPair(pair);
      latestRates[pair]["BanffPay Rate"] = Number(internalRate?.exchangeRate);

      // Add other vendor rates
      additionalRates[0]
        // @ts-ignore
        .filter((rate) => `${rate.from_currency}/${rate.to_currency}` === pair)
        // @ts-ignore
        .forEach((rate) => {
          latestRates[pair][`${rate.vendor} Exchange`] = parseFloat(rate.rate);
        });
    }

    return latestRates;
  } catch (error) {
    console.error("Error fetching latest exchange rates:", error);
    throw new Error("Internal Server Error");
  }
};

// export const fetchLatestExchangeRates = async (
//     page: number = 1,
//     pageSize: number = 50
//   ) => {
//     // Ensure page and pageSize are valid numbers, fallback to defaults if not
//     const validPage = (!page || isNaN(page) || page < 1) ? 1 : Number(page);
//     const validPageSize = (!pageSize || isNaN(pageSize) || pageSize < 1) ? 50 : Number(pageSize);
//     try {
//       const latestRates: Record<string, any> = {};

//       // Calculate offset for pagination
//       const offset = (validPage - 1) * validPageSize;

//       // Fetch the latest records for all specified pairs
//       const records = await ExchangeRate.findAll({
//         where: {
//           pair: {
//             [Op.in]: pairs,
//           },
//         },
//         order: [["createdAt", "DESC"]],
//         limit: validPageSize,
//         offset: offset,
//         //   limit: pairs.length, // Limit to the number of unique pairs
//       });

//       // Group the records by pair
//       const groupedRecords: Record<string, any> = {};
//       records.forEach((record) => {
//         if (!groupedRecords[record.pair]) {
//           groupedRecords[record.pair] = record;
//         }
//       });

//       const additionalRates = await getAdditionalRates();
//       const allRates = { ...groupedRecords };
//       additionalRates.forEach((additionalRate: any) => {
//         const pairKey = `${additionalRate.from_currency}/${additionalRate.to_currency}`;
//         if (!allRates[pairKey]) {
//           allRates[pairKey] = {}; // Create an empty object if not already present
//         }

//         // Add the additional rate under the appropriate vendor name (e.g., "bnb Exchange")
//         const vendorName = `${additionalRate.vendor} Exchange`;
//         allRates[pairKey][vendorName] = parseFloat(additionalRate.rate); // Ensure the rate is a number
//       });
//       const rateVendorPairs = Object.entries(allRates).flatMap(
//         ([pair, vendors]) => {
//           // For each pair (e.g., 'CAD/NGN'), filter the vendors to get only valid rates
//           return Object.entries(vendors)
//             .filter(([vendor, rateValue]) => {
//               return (
//                 rateValue !== null &&
//                 rateValue !== 0 &&
//                 vendor !== "BanffPay Rate"
//               ); // Filter out invalid rates
//             })
//             .map(([vendor, rateValue]) => ({
//               pair, // Add the currency pair as part of the result
//               vendor,
//               rate: rateValue as number,
//             }));
//         }
//       );
//       // Process each pair
//       for (const pair of pairs) {
//         const record = groupedRecords[pair];
//         latestRates[pair] = record ? record.rates : {};

//         // Add BanffPay rate
//         const answer = getTopAndBottomRatesWithAverages(
//           rateVendorPairs.filter((rate) => rate.pair === pair)
//         );
//         const internalRate = await getInternalRateByPair(pair);
//         const inverse = await getInternalRateByPair(inversePair(pair));
//         const isBuy = buyPairs.includes(pair);
//         const isBuyInverse = buyPairs.includes(inversePair(pair));

//         if (inverse) {
//           latestRates[pair]["BanffPay Rate"] = Number(inverse.sell_rate);
//         } else if (internalRate) {
//           latestRates[pair]["BanffPay Rate"] = Number(internalRate.buy_rate);
//         } else if (isBuy) {
//           latestRates[pair]["BanffPay Rate"] = Number(answer.buyRate.toFixed(2));
//         } else if (isBuyInverse) {
//           latestRates[pair]["BanffPay Rate"] = Number(answer.sellRate.toFixed(2));
//         } else {
//           latestRates[pair]["BanffPay Rate"] = Number(answer.top3Avg.toFixed(2));
//         }

//         // Add other vendor rates
//         additionalRates[0]
//           // @ts-ignore
//           .filter((rate) => `${rate.from_currency}/${rate.to_currency}` === pair)
//           // @ts-ignore
//           .forEach((rate) => {
//             latestRates[pair][`${rate.vendor} Exchange`] = parseFloat(rate.rate);
//           });
//       }
//       const totalRecords = await ExchangeRate.count({
//         where: {
//           pair: {
//             [Op.in]: pairs,
//           },
//         },
//       });
//       const totalPages = Math.ceil(totalRecords / validPageSize);

//       return {
//         data: latestRates,
//         meta: {
//           currentPage: validPage,
//           totalPages: totalPages,
//           pageSize: validPageSize,
//           totalRecords: totalRecords,
//         },
//       };
//     } catch (error) {
//       console.error("Error fetching latest exchange rates:", error);
//       throw new Error("Internal Server Error");
//     }
//   };
// export default {
//     fetchLatestExchangeRates
// };
