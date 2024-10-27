import CurrencyPair from '../models/CurrencyPair';

export const createCurrencyPair = async (data: any) => {
    return await CurrencyPair.create(data);
};

export const getAllCurrencyPairs = async () => {
    return await CurrencyPair.findAll();
};

export const getCurrencyPairById = async (id: number) => {
    return await CurrencyPair.findByPk(id);
};

export const updateCurrencyPair = async (id: number, data: any) => {
    const currencyPair = await CurrencyPair.findByPk(id);
    if (currencyPair) {
        return await currencyPair.update(data);
    }
    return null;
};

export const deleteCurrencyPair = async (id: number) => {
    const currencyPair = await CurrencyPair.findByPk(id);
    if (currencyPair) {
        return await currencyPair.destroy();
    }
    return null;
};
