import { CustomError } from "../middleware/errors";

interface ExchangeRates {
  [key: string]: number | null;
}

interface CurrencyData {
  [key: string]: ExchangeRates;
}

interface Stats {
  mean: number;
  median: number;
  highestTwo: number[];
  lowestTwo: number[];
  // banffPayRate?: {
  //   bpay_buy_rate: number;
  //   bpay_sell_rate: number;
  // }
}

interface Result {
  [key: string]: Stats;
}

const data: CurrencyData = {
  // paste your data here
};

// Helper functions
const calculateMean = (rates: number[]): number => {
  const top3Rates = rates.sort((a, b) => b - a).slice(0, 3);
  // console.log(top3Rates, "top3", rates)
  // Calculate the mean of the top 3 rates
  return top3Rates.reduce((sum, rate) => +sum + +rate, 0) / top3Rates.length;
  // return rates.reduce((sum, rate) => +sum + +rate, 0) / rates.length;
};

const calculateMedian = (rates: number[]): number => {
  const sorted = [...rates].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? +sorted[mid]
    : (+sorted[mid - 1] + +sorted[mid]) / 2;
};

// Main function to process data
export const calculateStats = (data: CurrencyData): Result => {
  const result: Result = {};

  for (const [currencyPair, ratesObj] of Object.entries(data)) {
    // Extract rates, filtering out null or zero values
    const rates = Object.values(ratesObj).filter((rate): rate is number => rate !== null && rate > 0); // Adjusted condition to exclude 0

    if (rates.length > 0) {
      // Calculate statistics
      const mean = calculateMean(rates);
      const median = calculateMedian(rates);
      // const banffPayRate = calculateBanffPayBuySellRate(rates, currencyPair)
      // Sort rates to find highest and lowest two
      const sortedRates = [...rates].sort((a, b) => a - b);
      // console.log(sortedRates, "sorted")
      const lowestTwo = sortedRates.slice(0, 2);
      const highestTwo = sortedRates.slice(-2);

      result[currencyPair] = { mean, median, highestTwo, lowestTwo };
    } else {
      // If no valid rates, provide defaults
      result[currencyPair] = { mean: 0, median: 0, highestTwo: [], lowestTwo: [] };
    }
  }

  return result;
};

export const calculateBanffPayBuySellRate = (rates: number[], sell_rates: number[], buy_adder: number, sell_reduct: number) => {
  let buy_Rate_Source;
  let sell_Rate_Source;
  buy_Rate_Source = Math.max(...rates) // Buy_Rate_Source
  sell_Rate_Source = Math.min(...sell_rates)// Sell_Rate_Source

  let bpay_buy_adder = buy_adder ?? 0.2;
  let bpay_sell_reduct = sell_reduct ?? 0.2;
  let bpay_buy_rate = 0; // calculated buy rate
  let bpay_sell_rate = 0; // calculated sell rate
  if (buy_Rate_Source && sell_Rate_Source) {



    const rateRoom = sell_Rate_Source - buy_Rate_Source
    // const rateRoom = buy_Rate_Source - sell_Rate_Source

    const rateRoomPercentage = (rateRoom / buy_Rate_Source) * 100
    const margin_percentage = 1
    const rate_margin = buy_Rate_Source / 100
    const percentage_allocation_room = rateRoomPercentage - margin_percentage


    const bpay_buy_discount = (bpay_buy_adder / 100) * buy_Rate_Source
    const bpay_sell_discount = (bpay_sell_reduct / 100) * sell_Rate_Source
    const discount_feasible = rateRoom - (rate_margin + bpay_buy_discount + bpay_sell_discount)
    console.log(discount_feasible, rateRoom, sell_Rate_Source, buy_Rate_Source)
    if (discount_feasible > 0) {
      bpay_buy_rate = buy_Rate_Source + bpay_buy_discount
      bpay_sell_rate = sell_Rate_Source - bpay_sell_discount
    } else {
      throw new CustomError("Sell rate cannot be lower than buy rate", 400);
      // if (bpay_buy_adder === 0) {
      //   bpay_buy_adder = buy_Rate_Source
      //   return
      // }
      // if (bpay_sell_reduct === 0) {
      //   bpay_buy_adder = sell_Rate_Source
      //   return
      // }
      // bpay_buy_adder = bpay_buy_adder - 0.05;
      // bpay_sell_reduct = bpay_buy_adder - 0.05;

    }
    return {
      bpay_buy_rate, bpay_sell_rate, bpay_buy_adder, bpay_sell_reduct, buy_Rate_Source, sell_Rate_Source
    }
  }

}

// // Calculate and log the result
// const stats = calculateStats(data);
// console.log(stats);


// export const calculateBanffPayBuySellRate = (rates: number[]) => {
//   const maxRate = Math.max(...rates); // Buy_Rate_Source
//   const minRate = Math.min(...rates); // Sell_Rate_Source
//   //  const maxRate = 1150
//   //  const minRate = 1175
//   let bpay_buy_adder = 0.2; // Bpay buy adder (in %)
//   let bpay_sell_reduct = 0.2; // Bpay sell reduct (in %)
//   let bpay_buy_rate = 0; // calculated buy rate
//   let bpay_sell_rate = 0; // calculated sell rate

//   const rateRoom = minRate - maxRate;
//   const rateRoomPercentage = (rateRoom / maxRate) * 100;
//   const margin_percentage = 1;
//   const rate_margin = (maxRate / 100);

//   while (bpay_buy_adder >= 0 && bpay_sell_reduct >= 0) {

//     const bpay_buy_discount = (bpay_buy_adder / 100) * maxRate;
//     const bpay_sell_discount = (bpay_sell_reduct / 100) * minRate;


//     const discount_feasible = rateRoom - (rate_margin + bpay_buy_discount + bpay_sell_discount);
//     console.log(discount_feasible)
//     if (discount_feasible > 0) {

//       bpay_buy_rate = maxRate + bpay_buy_discount;
//       bpay_sell_rate = minRate - bpay_sell_discount;
//       break;
//     } else {

//       bpay_buy_adder = Math.max(0, bpay_buy_adder - 0.05);
//       bpay_sell_reduct = Math.max(0, bpay_sell_reduct - 0.05);
//     }
//   }

//   if (bpay_buy_rate === 0) bpay_buy_rate = maxRate;
//   if (bpay_sell_rate === 0) bpay_sell_rate = minRate;

//   return {
//     bpay_buy_rate: bpay_buy_rate,
//     bpay_sell_rate: bpay_sell_rate,
//   };
// };



export function inversePair(pair: string) {
  return pair.split("/").reverse().join("/");
}


export const central_adder = 0.2
export const central_reduct = 0.2