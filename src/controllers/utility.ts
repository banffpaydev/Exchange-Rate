export function addCommasToNumber(number = 0) {
    if (!isNaN(number)) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return "0";
    }
  }