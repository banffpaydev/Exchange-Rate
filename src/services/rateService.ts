import axios from "axios";
import dotenv from 'dotenv';
import NodeCache from "node-cache";

dotenv.config();

const cache = new NodeCache({ stdTTL: 0 }); // Cache for 1 hour
export interface ICountry {
    id: string;
    name: string;
    iso_code: string;
    currency: string;
}
interface ICountryResponse {
    source: ICountry[];
    destination: ICountry[];
}
const username = process.env.PARTNER_REMITONE_USERNAME
const password = process.env.PARTNER_REMITONE_PASSWORD
const pin = process.env.PARTNER_REMITONE_PIN
export const getSourceAndDesCountries = async (): Promise<ICountryResponse> => {
    const cacheKey = "sourceAndDesCountries";
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return cachedData as ICountryResponse;
    }

    try {
        const payload = {
            username,
            password,
            pin
        }
        const [response1, response2] = await Promise.all([
            axios.post(`${process.env.PARTNER_REMITONE_BASE_URL}admin/remittance/get-source-countries`, payload),
            axios.post(`${process.env.PARTNER_REMITONE_BASE_URL}admin/remittance/get-destination-countries`, payload)
        ]);
        const data = { source: response1.data.data.result.countries.country, destination: response2.data.data.result.countries.country };
        cache.set(cacheKey, data);
        return data;
    } catch (err: any) {
        throw err
    }
}


export const updateSellRate = async (countryId: string, currency: string, destCountryId: string, destCurrency: string, rate: number) => {
    try {
        const response = await axios.post(`${process.env.PARTNER_REMITONE_BASE_URL}admin/remittance/update-sell-rate`, {
            username,
            password, pin, countryId, currency, destCountryId, destCurrency, category: "A", collectionRate: rate,
            transferRate: rate,
            cardRate: rate,
            homeDeliveryRate: rate,
            utilityBillRate: rate,
            mobileTransferRate: rate,
            walletTransferRate: rate,
        })
        console.log(currency,destCurrency, "remitOneRateUpdated")
        return response;
    } catch (err: any) {
        console.log(err)
        throw err
    }
}