import { calculateBanffPayBuySellRate, inversePair } from "../controllers/treps";
import InternalRate, { InternalRateAttributes } from "../models/internalRate";
import { getSourceAndDesCountries, updateSellRate } from "./rateService";

export const saveInternalRate = async (data: InternalRateAttributes) => {
    await InternalRate.create({
        ...data
    });
};

// export const saveMultipleInternalRates = async (data: InternalRateAttributes[]) => {
//     try {
//         await InternalRates.bulkCreate(data, { validate: true });
//         console.log('Internal rates saved successfully.');
//     } catch (error) {
//         console.error('Error saving internal rates:', error);
//     }
// };

export const saveMultipleInternalRates = async (data: InternalRateAttributes[]) => {
    try {
        // Loop through each item in the data array
        for (const rate of data) {
            // Use the upsert method, which will insert a new record if not found, or update the existing one
            await InternalRate.upsert({
                ...rate,  // Spread the current rate attributes
            });

            const from = rate.pair.split("/")[0]
            const to = rate.pair.split("/")[1]

            const sourceAndDesCountries = await getSourceAndDesCountries();
            const findSourceCountry = sourceAndDesCountries.source.find((country) => country.currency === from)
            const findDestCountry = sourceAndDesCountries.destination.find((country) => country.currency === to)
            if (findSourceCountry && findDestCountry) {
                const response = await updateSellRate(findSourceCountry?.id, findSourceCountry?.currency, findDestCountry?.id, findDestCountry?.currency, rate.buy_rate)
            }
        }

    } catch (error) {
        console.error('Error saving/updating internal rates:', error);
        throw "Error saving/updating internal rates:"
    }
};
export const deleteInternalRateByPair = async (pair: string) => {
    try {
        const deletedCount = await InternalRate.destroy({
            where: { pair },
        });

        if (deletedCount === 0) {
            throw new Error(`Pair ${pair} not found`);
        }

    } catch (error) {
        console.error('Error deleting internal rate:', error);
        throw error;
    }
};

export const getInternalRateByPair = async (pair: string) => {
    return await InternalRate.findOne({ where: { pair } });
};

export const getAllDBInternalRates = async () => {
    try {
        const allRates = await InternalRate.findAll();
        return allRates; // Returns all internal rates
    } catch (error) {
        console.error('Error fetching internal rates:', error);
        throw error; // Rethrow or handle the error accordingly
    }
};


export const updateInternalRateByPair = async (newRateData: InternalRateAttributes) => {
    try {
        const existingRate = await InternalRate.findOne({
            where: { pair: newRateData.pair },
        });

        if (!existingRate) {
            throw new Error(`Pair ${newRateData.pair} not found`);
        }

        const [updatedCount] = await InternalRate.update(newRateData, {
            where: { pair: newRateData.pair },  // Condition to match the pair
        });

        const from = newRateData.pair.split("/")[0]
        const to = newRateData.pair.split("/")[1]

        const sourceAndDesCountries = await getSourceAndDesCountries();
        const findSourceCountry = sourceAndDesCountries.source.find((country) => country.currency === from)
        const findDestCountry = sourceAndDesCountries.destination.find((country) => country.currency === to)
        if (findSourceCountry && findDestCountry) {
            const response = await updateSellRate(findSourceCountry?.id, findSourceCountry?.currency, findDestCountry?.id, findDestCountry?.currency, newRateData.buy_rate)
        }
        console.log(`Successfully updated internal rate for pair: ${newRateData.pair}`);
    } catch (error) {
        console.error('Error updating internal rate:', error);
        throw error;
    }
};

export const autoUpdateInternalRatesOnFetch = async (pair: string, fetchedRates: Record<string, number | null>) => {
    const cleanedFetchedRates: Record<string, number> = Object.fromEntries(
        Object.entries(fetchedRates).filter(([, rate]) => rate !== null) as [string, number][]
    );
    const invertPair = inversePair(pair)
    const internalRate = await InternalRate.findOne({ where: { pair: [pair, invertPair] } });
    if (!internalRate) {
        console.warn(`No internal rate found for pair: ${pair}`);
        return;
    }


    // Checking if it's the inverse pair
    const isInverse = internalRate.pair !== pair;


    const {
        buy_exchanges_considered,
        sell_exchanges_considered,
        bpay_buy_adder,
        bpay_sell_reduct
    } = internalRate;

    let recalculatedRates;

    // If it's an inverse pair, only update the sell rate
    if (isInverse) {
        // Filter the sell rates based on exchanges considered
        const updatedSellRates = Object.entries(cleanedFetchedRates)
            .filter(([exchange]) => sell_exchanges_considered?.hasOwnProperty(exchange)) // Match only the exchanges considered for selling
            .map(([, rate]) => rate);
        const buyRates = buy_exchanges_considered ? Object.entries(buy_exchanges_considered).map(([, rate]) => rate).filter(rate => rate != null) : [];

        console.log(updatedSellRates)
        // Recalculate sell rates based on updated sell rates
        recalculatedRates = calculateBanffPayBuySellRate(
            buyRates, // No buy rate adjustment needed for inverse
            updatedSellRates, // Only sell rates matter here
            bpay_buy_adder,
            bpay_sell_reduct
        );
    } else {
        // If it's not an inverse pair, only update the buy rate
        // Filter the buy rates based on exchanges considered
        const updatedBuyRates = Object.entries(cleanedFetchedRates)
            .filter(([exchange]) => buy_exchanges_considered?.hasOwnProperty(exchange)) // Match only the exchanges considered for buying
            .map(([, rate]) => rate);
        const sellRates = sell_exchanges_considered ? Object.entries(sell_exchanges_considered).map(([, rate]) => rate).filter(rate => rate != null) : [];

        // Recalculate buy rates based on updated buy rates
        recalculatedRates = calculateBanffPayBuySellRate(
            updatedBuyRates, // Only buy rates matter here
            sellRates, // No sell rate adjustment needed for normal pair
            bpay_buy_adder,
            bpay_sell_reduct
        );
    }

    // If recalculation failed, exit
    if (!recalculatedRates) {
        console.warn(`Failed to recalculate rates for pair: ${pair}`);
        return;
    }

    // Extract recalculated values
    const { bpay_buy_rate, bpay_sell_rate, buy_Rate_Source, sell_Rate_Source } = recalculatedRates;

    // Update the internal rate model (only update relevant fields)
    await InternalRate.update(
        {
            buy_rate: isInverse ? internalRate.buy_rate : bpay_buy_rate, // Update only buy rate if it's a normal pair
            sell_rate: isInverse ? bpay_sell_rate : internalRate.sell_rate, // Update only sell rate if it's an inverse pair
            buy_rate_source: buy_Rate_Source,
            sell_rate_source: sell_Rate_Source,
        },
        { where: { pair: internalRate.pair } }
    );


    console.log(`Updated internal rates for pair: ${pair}`);
};
