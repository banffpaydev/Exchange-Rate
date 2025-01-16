import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getRates, fetchDbRates, basisUrl } from "@/utils/api";
import { AdminRateRow } from "@/components/admin/AdminRateRow";
import { SaveRatesDialog } from "@/components/admin/SaveRatesDialog";
import axios from "axios";
import { AdminRateRowChn } from "@/components/admin/AdminRateRowChn";

const AdminRatesChn = () => {
  const navigate = useNavigate();
  const [editedRates, setEditedRates] = useState({});
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [remitOneCountries, setRemitOneCountries] = useState({});

  // const { data: rates, isLoading } = useQuery({
  //   queryKey: ['admin-rates'],
  //   queryFn: fetchDbRates,
  // });

  React.useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
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

  if (isLoading) return <div>Loading...</div>;
  if (!isLoading && error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Rate Management</h1>
        <Button onClick={() => setShowConfirmDialog(true)}>Save Changes</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency Pair</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Current Rate</TableHead>
              <TableHead>New Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((data, index) => {
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

            {/* {Object.entries(rates?.data || {}).map(([pair, rateData]) => (
              <AdminRateRow
                key={pair}
                pair={pair}
                rateData={rateData}
                editedRates={editedRates}
                onRateChange={handleRateChange}
              />
            ))} */}
          </TableBody>
        </Table>
      </div>

      <SaveRatesDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleSave}
        editedRates={editedRates}
      />
    </div>
  );
};

export default AdminRatesChn;
