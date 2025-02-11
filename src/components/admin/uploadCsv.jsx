import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { http } from "@/utils/config";

export function UploadCSVModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleFileChange = (event) => {
    const value = event.target.files?.[0];
    if (value) setFile(value);
  };

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      if (file) {
        await http.post(`current/upload-rates`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast.success("Rate data uploaded");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Unable to upload Rates!!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Upload CSV</DialogTitle>
          <DialogDescription>
            Upload CSV to add rate pairs or update pair{" "}
            <small className="font-bold">
              (note existing pairs will be update, while new pairs will be added
              to the system)
            </small>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-primary "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-primary">
                  Click to upload rate
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CSV</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              onChange={handleFileChange}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
            />
          </label>
          <div>{file && <button>{file?.name} Uploaded</button>}</div>
        </div>
        <DialogFooter>
          <Button
            loading={loading}
            onClick={() => {
              if (file) {
                handleUpload(file);
              } else {
                toast.error("Please Upload a csv file");
              }
            }}
            type="submit"
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
