import { Op, Sequelize, QueryTypes } from 'sequelize';
import sequelize from '../config/db';
import CurrencyPair from '../models/CurrencyPair';
import RawCurrencyPair from '../models/RawCurrencyPair';
// import { pairs } from './ExchangeRateService';


export const runCreateTables = async () => {
  const response = await sequelize.query(
    `CREATE TABLE IF NOT EXISTS exchange_rate_py (
      id SERIAL PRIMARY KEY,
      from_currency VARCHAR(10) NOT NULL,
      to_currency VARCHAR(10) NOT NULL,
      rate NUMERIC NOT NULL,
      vendor VARCHAR(50) NOT NULL,  -- Vendor column for tracking source
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (from_currency, to_currency, vendor)
    )`
  );
}

export const createCurrencyPair = async (data: any) => {

  return await CurrencyPair.create(data);
};

export const createRawCurrencyPair = async (data: any) => {

  return await RawCurrencyPair.create(data);
};

// export const getAllCurrencyPairs = async () => {
//     return await CurrencyPair.findAll();
// };
export const pairs = [
  'USD/CAD', 'USD/EUR', 'USD/GBP',
  'CAD/USD', 'CAD/EUR', 'CAD/GBP',
  'EUR/USD', 'EUR/CAD', 'EUR/GBP',
  'GBP/USD', 'GBP/CAD', 'GBP/EUR'
];
export const getAllCurrencyPairs = async () => {


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

export const getAllRawCurrencyPairs = async () => {


  return await RawCurrencyPair.findAll({
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

export const getRAWCurrencyPairById = async (id: number) => {
  return await RawCurrencyPair.findByPk(id);
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



// export const getAdditionalRates = async (): Promise<any[]> => {
//     try {
//       const rates = await sequelize.query(
//         'SELECT * FROM exchange_rate_py'
//       );
//       return rates;
//     } catch (error) {
//       console.error('Error fetching specific rates:', error);
//       throw error;
//     }
//   };


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


export const getAdditionalRatesId = async (from_currency: string, to_currency: string): Promise<any[]> => {
  try {
    const rates = await sequelize.query(
      `SELECT * FROM exchange_rate_py 
             WHERE from_currency = :from_currency 
             AND to_currency = :to_currency`,
      {
        replacements: { from_currency, to_currency },
        // @ts-ignore
        type: sequelize.QueryTypes.SELECT
      }
    );
    return rates;
  } catch (error) {
    console.error('Error fetching specific rates:', error);
    throw error;
  }
};

// getAdditionalRatesId('CAD', 'NGN').then(console.log).catch(console.error);


// Usage
// getSpecificRates('CAD', 'GBP').then(console.log).catch(console.error);


// Usage
// getSpecificRates('CAD', 'GBP').then(console.log).catch(console.error);

