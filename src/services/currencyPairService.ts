import { Op, Sequelize, QueryTypes } from 'sequelize';
import sequelize from '../config/db';
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


const getSpecificRates = async (fromCurrency: string, toCurrency: string): Promise<any[]> => {
  try {
    const rates = await sequelize.query(
      'SELECT * FROM exchange_rate_py WHERE from_currency = :fromCurrency AND to_currency = :toCurrency',
      {
        replacements: { fromCurrency, toCurrency },
        type: QueryTypes.SELECT,
      }
    );
    return rates;
  } catch (error) {
    console.error('Error fetching specific rates:', error);
    throw error;
  }
};



export const getAdditionalRates = async (): Promise<any[]> => {
    try {
      const rates = await sequelize.query(
        'SELECT * FROM exchange_rate_py'
      );
      return rates;
    } catch (error) {
      console.error('Error fetching specific rates:', error);
      throw error;
    }
  };

// Usage
// getSpecificRates('CAD', 'GBP').then(console.log).catch(console.error);

