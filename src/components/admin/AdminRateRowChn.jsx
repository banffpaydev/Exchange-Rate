import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { basisUrl } from "@/utils/api";
import axios from "axios";
import { formatNumber, formatNumberStr } from "../dashboard/ScrollingRates";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";
import { SaveRatesDialog } from "./SaveRatesDialog";

export const AdminRateRowChn = ({ pair, rateData, id, remitOneEnabled }) => {
  // console.log("mape: ", formatNumberStr(rateData))
  const [editedRates, setEditedRates] = useState(formatNumberStr(rateData));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const token = sessionStorage.getItem("token");

  const handleSave = async () => {
    const pairArray = pair.split("/");
    try {
      setLoading(true);
      const response = await axios.put(
        `${basisUrl}/api/current/pairs/${id}`,
        {
          exchangeRate: editedRates,
          from: pairArray[0],
          to: pairArray[1],
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      toast.success("Rate data updated");
      // if (response.data != null) {
      //   toast.success("Rate data updated");
      // }
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Unable to update Rates!!");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    try {
      setAnalysing(true);
      const currentDateTime = new Date().toISOString();
      const response = await axios.get(`${basisUrl}/api/rates/getrates`, {
        params: {
          currency: pair,
          startDate: currentDateTime.split("T")[0],
          endDate: currentDateTime,
        },
      });

      if (response.data) {
        setAnalysis(response.data);
      } else {
        throw new Error("Empty response data");
      }
    } catch (error) {
      console.error("Error fetching Rate Analysis:", error);
    } finally {
      setAnalysing(false);
    }
  };

  const handleDownloadCsv = () => {
    const [baseCurrency, destCurrency] = pair.split("/");
    const csvContent = [
      { dest_currency_code: baseCurrency, rate: rateData, auto_update: "f" },
      { dest_currency_code: destCurrency, rate: 0.01, auto_update: "f" }, // Adjust rate as per your logic
    ];

    const csvHeaders = ["dest_currency_code,rate,auto_update"];
    const csvRows = csvContent.map(
      (row) => `${row.dest_currency_code},${row.rate},${row.auto_update}`
    );

    const csvString = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${pair}_rates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <SaveRatesDialog
        loading={loading}
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleSave}
        editedRates={editedRates}
        pair={pair}
        oldRate={rateData?.toFixed(2)}
      />
      <TableRow key={`${pair}`}>
        <TableCell>
          {pair}{" "}
          {remitOneEnabled && (
            <small className="text-green-600 text-[10px] font-semibold mt-1">
              Remitone Pair
            </small>
          )}
        </TableCell>
        <TableCell>
        <Input
            type="number"
            step="0.0001"
            className="bg-slate-400 w-32"
            value={editedRates || ""}
            onChange={(e) => setEditedRates(e.target.value)}
          />
          {/* {rateData?.toFixed(2).toLocaleString("en-US") || "N/A"} */}
        </TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.0001"
            className="bg-slate-400 w-32"
            value={editedRates || ""}
            onChange={(e) => setEditedRates(e.target.value)}
          />
        </TableCell>
        <TableCell>
          <Button
            disabled={loading || analysing}
            onClick={() => {
              setShowConfirmDialog(true);
            }}
            className="mr-2"
          >
            Update{" "}
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
          <Button
            disabled={loading || analysing}
            onClick={handleAnalysis}
            className="mr-2"
          >
            Analyze{" "}
            {analysing && (
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
          <Button onClick={handleDownloadCsv}>Download CSV</Button>
        </TableCell>
      </TableRow>

      {analysis && (
        <TableRow>
          <TableCell colSpan="5">
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-lg mb-4">Analysis Data</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-green-600 mb-2">
                    Top Rates:
                  </h5>
                  <div className="space-y-2">
                    {analysis.top3.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">
                          {item.vendor.toUpperCase()}:
                        </span>
                        <span>
                          {formatNumber(item.rate).toLocaleString("en-US") ||
                            "null"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-red-600 mb-2">
                    Bottom Rates:
                  </h5>
                  <div className="space-y-2">
                    {analysis.bottom3.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">
                          {item.vendor.toUpperCase()}:
                        </span>
                        <span>
                          {formatNumber(item.rate).toLocaleString("en-US") ||
                            "null"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <span className="font-semibold">Top 3 Average:</span>
                  <span className="ml-2">
                    {analysis.top3Avg?.toFixed(2).toLocaleString("en-US") ||
                      "null"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Bottom 3 Average:</span>
                  <span className="ml-2">
                    {analysis.bottom3Avg?.toFixed(2).toLocaleString("en-US") ||
                      "null"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Overall Average:</span>
                  <span className="ml-2">
                    {analysis.minAvg?.toFixed(2).toLocaleString("en-US") ||
                      "null"}
                  </span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
