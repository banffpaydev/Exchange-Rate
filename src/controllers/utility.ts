export function addCommasToNumber(number = 0) {
  if (!isNaN(number)) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return "0";
  }
}


// export const destCountriesWithAdditionalCurrencies = [
//   {
//     currency: "CAD",
//     additionalCurrencies: ["LRD", "USD"],
//   },
//   {
//     currency: "GHS",
//     additionalCurrencies: ["USD"],
//   },
//   {
//     currency: "XOF",
//     additionalCurrencies: ["USD"],
//   },
//   {
//     currency: "LRD",
//     additionalCurrencies: ["USD"],
//   },
// ];


// export const sourceCountriesWithAdditionalCurrencies = [
//   {
//     currency: "CAD",
//     additionalCurrencies: ["USD", "NGN", "ZBN", "LRD"],
//   },
//   {
//     currency: "GMD",
//     additionalCurrencies: ["GMD"],
//   },
//   {
//     currency: "LRD",
//     additionalCurrencies: ["CAD", "LRD", "NGN" ],
//   },
//   {
//     currency: "NGN",
//     additionalCurrencies: ["NGN"],
//   },
// ];

export const sourceCountriesWithAdditionalCurrencies = [
    {
      country: "Liberia",
      additionalCurrencies: ["USD", "NGN", "ZBN", "LRD"],
    },
    {
      currency: "GMD",
      additionalCurrencies: ["GMD"],
    },
    {
      currency: "LRD",
      additionalCurrencies: ["CAD", "LRD", "NGN" ],
    },
    {
      currency: "NGN",
      additionalCurrencies: ["NGN"],
    },
  ];