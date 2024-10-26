import React from 'react';
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

export const SaveRatesDialog = ({ open, onOpenChange, onConfirm, editedRates }) => {
  const changedRates = Object.entries(editedRates).reduce((acc, [pair, vendors]) => {
    const changes = Object.entries(vendors).map(([vendor, newRate]) => ({
      pair,
      vendor,
      newRate
    }));
    return [...acc, ...changes];
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Rate Changes</DialogTitle>
          <DialogDescription>
            Please review the following rate changes before saving:
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] mt-4">
          <div className="space-y-4">
            {changedRates.map(({ pair, vendor, newRate }, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{pair} - {vendor}</span>
                <span className="text-green-600">{newRate}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};