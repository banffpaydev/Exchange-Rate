import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ColorRing } from "react-loader-spinner";

export const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  pair,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete special rate{" "}
            <strong>({pair})</strong>:
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button
            disabled={loading}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="bg-red-500" disabled={loading} onClick={onConfirm}>
            Delete{" "}
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
