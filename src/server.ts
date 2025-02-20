import app from "./app";
import dotenv from "dotenv";
import {
  handleAllFetch,
  removeRateKeyForAllPairs,
  sendRate,
  sendRateToPartners,
  sendWaveRate,
} from "./services/ExchangeRateService";
import { calculateBanffPayBuySellRate } from "./controllers/treps";
import axios from "axios";
import CountryList from "country-list-with-dial-code-and-flag";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
 
  // console.log(calculateBanffPayBuySellRate())
  // sendWaveRate("CAD", "NGN")
  // removeRateKeyForAllPairs("Twelve Data exchange")
  // removeRateKeyForAllPairs("xchangeRt exchange")
  // removeRateKeyForAllPairs("abokifxng")

  handleAllFetch()
  // sendRate()
  // sendRateToPartners()
  async function checkServerStatus() {
    try {
      const response = await axios.get("https://api-exchange.bpay.africa/test");
      console.log(response);
      if (response.status === 200) {
        console.log("Server is active");
      }
    } catch (error) {
      console.log(error);
      console.error("Server is down, sending email...");
      // sendEmailNotification();
    }
  }
  // await checkServerStatus()
  console.log(`Server is running on port ${PORT}`);
});
