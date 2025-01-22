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

export const SaveRatesDialog = ({
  open,
  onOpenChange,
  onConfirm,
  editedRates,
  pair,
  oldRate,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Rate Changes</DialogTitle>
          <DialogDescription>
            Are you sure you want to update rate of <strong>({pair})</strong>:
            <small>This will update the rate on RemitOne platform</small>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] mt-4">
          <div className="space-y-4 font-bold flex items-center justify-between">
            <div className="space-x-2">
              Old Rate
              <span className="text-red-600 ml-2">{oldRate}</span>
            </div>
            <div className="space-x-2">
              New Rate
              <span className="text-green-600 ml-2">{editedRates}</span>
            </div>
            {/* {changedRates.map(({ pair, vendor, newRate }, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">
                  {pair} - {vendor}
                </span>
                <span className="text-green-600">{newRate}</span>
              </div>
            ))} */}
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
          <Button disabled={loading} onClick={onConfirm}>
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
