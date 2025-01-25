import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { basisUrl } from "@/utils/api";
import { SaveRatesDialog } from "@/components/admin/SaveRatesDialog";
import axios from "axios";
import {
  AdminRateRowChn,
  SpecialAdminRateRowChn,
} from "@/components/admin/AdminRateRowChn";
import { useStore } from "../../store/store";
import { SpecialRatesDialog } from "@/components/admin/specialRatesDialog";
export const prioritizedPairs = [
  "USD/NGN",
  "USD/GHS",
  "USD/XAF",
  "USD/XOF",
  "USD/SLL",
  "USD/GAM",
  "GBP/NGN",
  "GBP/GHS",
  "GBP/XAF",
  "GBP/XOF",
  "GBP/SLL",
  "GBP/GAM",
  "CAD/NGN",
  "CAD/GHS",
  "CAD/XAF",
  "CAD/XOF",
  "CAD/SLL",
  "CAD/GAM",
  "EUR/NGN",
  "EUR/GHS",
  "EUR/XAF",
  "EUR/XOF",
  "EUR/SLL",
  "EUR/GAM",
];
const AdminRatesChn = () => {
  const navigate = useNavigate();
  const [editedRates, setEditedRates] = useState({});
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSpecial, setIsLoadingSpecials] = useState(true);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [remitOneCountries, setRemitOneCountries] = useState({});
  const [specialRates, setSpecialRates] = useState([]);
  const { user } = useStore();

  React.useEffect(() => {
    if (user)
      if (user?.type !== "admin") {
        navigate("/login");
        return;
      }
  }, [navigate]);

  const handleRateChange = (pair, vendor, value) => {
    setEditedRates((prev) => ({
      ...prev,
      [pair]: {
        ...(prev[pair] || {}),
        [vendor]: value,
      },
    }));
  };

  const fetchSpecialRates = async () => {
    setIsLoadingSpecials(true);
    try {
      const response = await axios.get(
        `${basisUrl}/api/current/get-all-internal`
      );
      setSpecialRates(response.data);
      setIsLoadingSpecials(false);
      toast.success("Rate data fetched");
    } catch (error) {
      setIsLoadingSpecials(false);
      setError("Unable to fetch Rates!!");
      toast.error("Unable to fetch Rates!!");
    }
  };
  const fetchRecentRates = async () => {
    try {
      const response = await axios.get(`${basisUrl}/api/current/pairs`);
      const countries = await axios.get(
        `${basisUrl}/api/current/remitoneCountries`
      );
      setRemitOneCountries(countries.data);
      setRates(response.data);
      setIsLoading(false);
      toast.success("Rate data fetched");
    } catch (error) {
      setIsLoading(false);
      setError("Unable to fetch Rates!!");
      toast.error("Unable to fetch Rates!!");
    }
  };
  React.useEffect(() => {
    fetchRecentRates();
    fetchSpecialRates();
  }, []);

  const handleSave = async () => {
    setShowConfirmDialog(false);
    try {
      // Here you would make the API call to save the rates
      toast.success("Rates updated successfully");
    } catch (error) {
      toast.error("Failed to update rates");
    }
  };

  if (isLoading || isLoadingSpecial) return <div>Loading...</div>;
  if (!isLoading && error) return <div>{error}</div>;
  const specialRatePairs = new Set(specialRates.map((rate) => rate.pair)); // Collect all special pairs
  const filteredRates = rates.filter((rate) => !specialRatePairs.has(rate.currencyPair)); // Exclude special pairs
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Rate Management</h1>
        <Button onClick={() => setShowRateDialog(true)}>
          Create Special Rate
        </Button>
      </div>
      <h1 className="text-xl font-bold mb-2">Special Rates</h1>
      <div className="rounded-md mb-4 border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency Pair</TableHead>
              <TableHead>Buy Adder</TableHead>
              <TableHead>BanffPay Buy Rate</TableHead>
              <TableHead>Sell Reduct</TableHead>
              <TableHead>Banffpay Sell Rate</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {specialRates?.map((data) => {
              return (
                <SpecialAdminRateRowChn
                  key={data.id}
                  id={data.id}
                  pair={data.pair}
                  onRateChange={handleRateChange}
                  remitOneEnabled={true}
                  special
                  fetchSpecialRates={fetchSpecialRates}
                  {...data}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <h1 className="text-xl font-bold mb-2">Other Rates</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency Pair</TableHead>
              {/* <TableHead>Current Rate</TableHead> */}
              <TableHead>BanffPay Buy Rate</TableHead>
              <TableHead>Banffpay Sell Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRates
              .sort((a, b) => {
                const isPriorityA = prioritizedPairs.includes(a.currencyPair);
                const isPriorityB = prioritizedPairs.includes(b.currencyPair);

                if (isPriorityA && !isPriorityB) return -1;
                if (!isPriorityA && isPriorityB) return 1;
                return 0; // Maintain original order for non-priority pairs
              })
              .map((data) => {
                const pairArray = data.currencyPair.split("/");

                const findSourceCountry = remitOneCountries?.source.find(
                  (country) => country.currency === pairArray[0]
                );
                const findDestCountry = remitOneCountries?.destination.find(
                  (country) => country.currency === pairArray[1]
                );
                const remitOneEnabled = findSourceCountry && findDestCountry;

                return (
                  <AdminRateRowChn
                    key={data.id}
                    id={data.id}
                    pair={data.currencyPair}
                    rateData={data.exchangeRate}
                    editedRates={editedRates}
                    onRateChange={handleRateChange}
                    remitOneEnabled={remitOneEnabled}
                  />
                );
              })}
          </TableBody>
        </Table>
      </div>

      <SpecialRatesDialog
        open={showRateDialog}
        onOpenChange={setShowRateDialog}
        onComplete={fetchSpecialRates}
      />
      <SaveRatesDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleSave}
        editedRates={editedRates}
        // remitOne={remitOneEnabled}
      />
    </div>
  );
};

export default AdminRatesChn;
