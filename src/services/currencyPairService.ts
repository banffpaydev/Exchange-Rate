import { Op, Sequelize } from 'sequelize';
import CurrencyPair from '../models/CurrencyPair';

export const createCurrencyPair = async (data: any) => {
    return await CurrencyPair.create(data);
};

// export const getAllCurrencyPairs = async () => {
//     return await CurrencyPair.findAll();
// };

export const getAllCurrencyPairs = async () => {
    const pairs = [
        'USD/NGN', 'EUR/NGN', 'GBP/NGN', 'CAD/NGN',
        'USD/LRD', 'EUR/LRD', 'GBP/LRD', 'CAD/LRD',
        'GHS/NGN', 'AED/NGN', 'SLL/NGN', 'RWF/NGN',
        'GHS/LRD', 'AED/LRD', 'SLL/LRD', 'RWF/LRD',
        'NGN/USD', 'NGN/EUR', 'NGN/GBP', 'NGN/CAD',
        'LRD/USD', 'LRD/EUR', 'LRD/GBP', 'LRD/CAD',
        'NGN/GHS', 'NGN/AED', 'NGN/SLL', 'NGN/RWF',
        'LRD/GHS', 'LRD/AED', 'LRD/SLL', 'LRD/RWF'
    ];

    return await CurrencyPair.findAll({
        where: {
            currencyPair: { [Op.in]: pairs },
            createdAt: {
                [Op.in]: Sequelize.literal(`(
                    SELECT MAX("createdAt") 
                    FROM "currency_pairs" 
                    WHERE "currencyPair" = "CurrencyPair"."currencyPair"
                )`)
            }
        },
        order: [['currencyPair', 'ASC']],
    });
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
