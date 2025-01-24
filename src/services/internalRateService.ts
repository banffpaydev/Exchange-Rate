import InternalRate, { InternalRateAttributes } from "../models/internalRate";

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
        }
        console.log('Internal rates saved/updated successfully.');
    } catch (error) {
        console.error('Error saving/updating internal rates:', error);
        throw "Error saving/updating internal rates:"
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

        if (updatedCount === 0) {
            throw new Error('No changes made during the update');
        }

        console.log(`Successfully updated internal rate for pair: ${newRateData.pair}`);
    } catch (error) {
        console.error('Error updating internal rate:', error);
        throw error;
    }
};
