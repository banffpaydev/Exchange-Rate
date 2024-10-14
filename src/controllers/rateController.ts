import { Request, Response } from "express";
import { getRatesFromDB, getRatesFromDBPairs, handleAllFetch, saveDatatoDb } from '../services/ExchangeRateService';


function removeFirstAndLastChar(str: string) {
    if (str.length <= 2) {
        return ''; // If the string has only two characters or less, return an empty string
    }
    return str.slice(1, -1); // Removes the first and last characters
}


function parseCustomJSONString(jsonString: string) {
    // Step 1: Replace problematic keys or values (with spaces) with valid ones for JSON parsing
    const cleanedString = jsonString.replace(/"([^"]+)":/g, (_, key) => {
        // Replace spaces with underscores or any other valid character for JSON keys
        const sanitizedKey = key.replace(/\s/g, '_');
        return `"${sanitizedKey}":`;
    });

    // Step 2: Parse the cleaned string into a JSON object
    try {
        const parsedObject = JSON.parse(cleanedString);
        // return removeFirstAndLastChar(jsonString);
        return parsedObject;
    } catch (error: any) {
        throw new Error(`Invalid JSON string: ${error.message}`);
    }
}




class RateController {
    static async getRates(req: Request, res: Response) {
        try {
            const rates = await handleAllFetch();
            return res.status(200).json({
                message: "Rate Fetched",
                success: true,
                data: rates
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Unable to fetch Rate",
                success: false,
                error: error.message,
            })
        }
    }

    static async saveData(req: Request, res: Response) {
        try {
            const rates = await saveDatatoDb(req.body);
            return res.status(200).json({
                message: "Rate Fetched",
                success: true,
                data: rates
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Unable to fetch Rate",
                success: false,
                error: error.message,
            })
        }
    }

    static async getDBRATES(req: Request, res: Response) {
        try {
            // Fetch all rates from the database
            const rates = await getRatesFromDB();
    
            // Parse rates field in each record from JSON string to object
            // const parsedRates = rates.map((rate: any) => {
            //     return {
            //         ...rate,
            //         rates: parseCustomJSONString(rate.rates) // Convert rates to JSON object
            //     };
            // });
    
            return res.status(200).json({
                message: "Rate Fetched from Database",
                success: true,
                data: rates
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Unable to fetch Rate from DB",
                success: false,
                error: error.message,
            });
        }
    }
    
    static async getDBPairRATES(req: Request, res: Response) {
        const pairs = req.query.pair;
    
        if (!pairs) {
            return res.status(400).json({
                message: "Currency pair is required",
                success: false,
            });
        }
    
        try {
            // Ensure pairs is a string or array of strings
            const ratePairs = Array.isArray(pairs) ? pairs : [pairs];
    
            // Fetch rates for the given pairs
            const rates = await Promise.all(
                // @ts-ignore
                ratePairs.map(async (pair: string) => {
                    // Format the pair if necessary (this currently doesn't change anything)
                    const formattedPair = pair.replace('/', '/');
                    
                    // Fetch rates for the pair
                    const vamp = await getRatesFromDBPairs(formattedPair);
                    
                    // Parse the rates from the database (assuming vamp.rates is a JSON string)
                    // @ts-ignore
                    // vamp.rates = parseCustomJSONString(vamp.rates);
    
                    return vamp;
                })
            );
    
            return res.status(200).json({
                message: "Rates Fetched from Database",
                success: true,
                data: rates,
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Unable to fetch rates from DB",
                success: false,
                error: error.message,
            });
        }
    }
    

}

export default RateController;