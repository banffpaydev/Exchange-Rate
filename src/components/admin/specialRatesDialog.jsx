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
import { MultipleSelector } from "../ui/multiSelect";
import { toast } from "sonner";
import axios from "axios";
import { basisUrl } from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { currencyPairs } from "@/pages/ExchangeRates";
import { http } from "@/utils/config";

export const SpecialRatesDialog = ({
  open,
  onOpenChange,
  onComplete,
  pair,
  bpay_buy_adder,
  bpay_sell_reduct,
  inverse_vendors_considered,
  ...props
}) => {
  const [formData, setData] = useState({
    bpay_buy_adder: bpay_buy_adder ?? 0.2,
    bpay_sell_reduct: bpay_sell_reduct ?? 0.2,
    inverse_vendors_considered: inverse_vendors_considered
      ? Object.keys(inverse_vendors_considered)
      : [],
    pair: pair ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [pairVendors, setPairVendors] = useState([]);
  const handleSave = async () => {
    setLoading(true);

    try {
      if (pair) {
        await http.put(`current/update-internal`, {
          ...formData,
        });
      } else {
        await http.post(`current/calculate-internal`, {
          pairs: [formData],
        });
      }

      toast.success("Rate data updated");
      // if (response.data != null) {
      //   toast.success("Rate data updated");
      // }
      onOpenChange(false);
      onComplete();
    } catch (error) {
      console.log(error);
      toast.error("Unable to update Rates!!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRateByPair = async (pair) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${basisUrl}/api/current/dbrate-by-Pair?pair=${pair}`
        );
        setLoading(false);
        const keys = Object.keys(response.data?.rates || {});
        setPairVendors(keys);
        toast.success("Vendors data fetched");
      } catch (error) {
        setLoading(false);
        toast.error("Unable to fetch Vendors!!");
      }
    };

    if (open && formData.pair) {
      fetchRateByPair(formData.pair);
    }
  }, [formData.pair, open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          {console.log(formData.inverse_vendors_considered)}
          <DialogTitle>Confirm Rate Changes</DialogTitle>
          <DialogDescription>
            Creating/Updating this pair{" "}
            {formData.pair && <strong>({formData.pair})</strong>} will update
            the rate on RemitOne Platform and will change the BpayRate
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] px-3 mt-4">
          {!pair && (
            <div className="w-full">
              <p>Pair</p>
              <Select
                className="w-full focus:ring-0"
                value={formData.pair}
                onValueChange={(value) => {
                  setData((prev) => ({ ...prev, pair: value }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a pair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pairs</SelectLabel>
                    {currencyPairs.map((data, i) => {
                      return (
                        <SelectItem key={i} value={data}>
                          {data}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <p>Sell Rates to Consider</p>
            <MultipleSelector
              values={formData.inverse_vendors_considered}
              onChange={(value) => {
                console.log(value);
                setData((prev) => ({
                  ...prev,
                  inverse_vendors_considered: value,
                }));
              }}
              options={pairVendors.map((vendor) => {
                return { label: vendor, value: vendor };
              })}
            />
          </div>
          <div className="flex mt-2 items-center gap-2">
            <div>
              <p>Buy Adder</p>
              <Input
                type="number"
                step="0.0001"
                className="bg-slate-400 "
                value={formData.bpay_buy_adder || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    bpay_buy_adder: e.target.value,
                  }))
                }
              />{" "}
            </div>
            <div>
              <p>Sell Reduct</p>
              <Input
                type="number"
                step="0.0001"
                className="bg-slate-400 "
                value={formData.bpay_sell_reduct || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    bpay_sell_reduct: e.target.value,
                  }))
                }
              />{" "}
            </div>
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
