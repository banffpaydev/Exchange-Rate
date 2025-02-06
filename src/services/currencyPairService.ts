import { Op, Sequelize, QueryTypes } from 'sequelize';
import sequelize from '../config/db';
import CurrencyPair from '../models/CurrencyPair';
import RawCurrencyPair from '../models/RawCurrencyPair';
import { pairs } from './ExchangeRateService';
import ExchangeCountries from '../models/ExchangeCountries';
import countries from '../seeds/countries.json';

export async function seedCountries() {
  try {
    await ExchangeCountries.sync({ force: true });
    await ExchangeCountries.bulkCreate(countries);
    console.log('Countries have been populated successfully.');
  } catch (error) {
    console.error('Error populating countries:', error);
  }
}

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
// export const pairs = [
//   'USD/CAD', 'USD/EUR', 'USD/GBP',
//   'CAD/USD', 'CAD/EUR', 'CAD/GBP',
//   'EUR/USD', 'EUR/CAD', 'EUR/GBP',
//   'GBP/USD', 'GBP/CAD', 'GBP/EUR'
// ];
export const getPaginatedCurrencyPairs = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const data = await CurrencyPair.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  return {
    data: data.rows,
    total: data.count,
    currentPage: page,
    totalPages: Math.ceil(data.count / limit),
  };
};
export const getAllCurrencyPairs = async () => {
  return await sequelize.query(`
    WITH RankedPairs AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY "currencyPair" 
          ORDER BY "createdAt" DESC
        ) as rn
      FROM currency_pairs
      WHERE "currencyPair" IN (${pairs.map(p => `'${p}'`).join(',')})
    )
    SELECT * FROM RankedPairs 
    WHERE rn = 1
    ORDER BY "currencyPair" ASC
  `, {
    model: CurrencyPair,
    mapToModel: true
  });
};

export const getSingleCurrencyPair = async (pair: string) => {
  return await CurrencyPair.findOne({
    where: { currencyPair: pair },
    order: [['createdAt', 'DESC']] // Get the latest record
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

export const getCurrencyPairByPair = async (pair: string) => {
  return await CurrencyPair.findOne({ where: { currencyPair: pair }, order: [['createdAt', 'DESC']] });
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

export const updateLatestCurrencyPair = async (pair: string, data: any) => {
  const latestPair = await CurrencyPair.findOne({
    where: { currencyPair: pair },
    order: [['createdAt', 'DESC']], // Get the newest entry
  });

  if (latestPair) {
    return await latestPair.update(data);
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

