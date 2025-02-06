import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorRing } from "react-loader-spinner";
import { Input } from "../ui/input";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { prioritizedPairs } from "@/pages/AdminRates copy";

export const SpecialRatesDialog = ({ open, onOpenChange, filteredRates }) => {
  const [loading, setLoading] = useState(false);
  const [searchedRates, setSearchedRates] = useState([]);

  // const handleSave = async () => {
  //   setLoading(true);

  //   try {
  //     if (pair) {
  //       await http.put(`current/update-internal`, {
  //         ...formData,
  //       });
  //     } else {
  //       await http.post(`current/calculate-internal`, {
  //         pairs: [formData],
  //       });
  //     }

  //     toast.success("Rate data updated");
  //     // if (response.data != null) {
  //     //   toast.success("Rate data updated");
  //     // }
  //     onOpenChange(false);
  //     onComplete();
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error?.response?.data?.message ?? "Unable to update Rates!!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = filteredRates?.filter((rate) =>
      rate.currencyPair.toLowerCase().includes(query)
    );
    setSearchedRates(filtered);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Update Rate</DialogTitle>
          <DialogDescription>
            Creating/Updating this pair{" "}
            {
              " This will update the rates on RemitOne Platform and will change the BpayRate"
            }{" "}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <div className="rounded-md border">
            <Input
              type="text"
              className="max-w-[200px]"
              placeholder="search pair"
              onChange={handleSearch}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Pair</TableHead>

                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRates
                  .sort((a, b) => {
                    const isPriorityA = prioritizedPairs.includes(
                      a.currencyPair
                    );
                    const isPriorityB = prioritizedPairs.includes(
                      b.currencyPair
                    );

                    if (isPriorityA && !isPriorityB) return -1;
                    if (!isPriorityA && isPriorityB) return 1;
                    return 0; // Maintain original order for non-priority pairs
                  })
                  .map((data) => {
                    const pairArray = data.currencyPair.split("/");

                    const findSourceCountry = remitOneCountries?.source?.find(
                      (country) => country.currency === pairArray[0]
                    );
                    const findDestCountry =
                      remitOneCountries?.destination?.find(
                        (country) => country.currency === pairArray[1]
                      );
                    const remitOneEnabled =
                      findSourceCountry && findDestCountry;

                    return (
                      <AdminRateRowChn
                        key={data.id}
                        id={data.id}
                        pair={data.currencyPair}
                        rateData={data.exchangeRate}
                        editedRates={editedRates}
                        onRateChange={handleRateChange}
                        remitOneEnabled={remitOneEnabled}
                        other
                      />
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button
            disabled={loading}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleSave}>
            Confirm Changes{" "}
            {loading && (
              <ColorRing
                visible={true}
                height="25"
                width="25"
                ariaLabel="color-ring-loading"
                wrapperStyle={{}}
                wrapperClass={`color-ring-wrapper `}
                colors={["#fff", "#fff", "#fff", "#fff", "#fff"]}
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
