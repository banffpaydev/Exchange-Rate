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
