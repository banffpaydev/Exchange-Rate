import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export const AdminRateRow = ({ pair, rateData, editedRates, onRateChange }) => {
  // Define prioritized pairs based on the table in the image
  const prioritizedPairs = [
    'USD/NGN', 'USD/GHS', 'USD/XAF', 'USD/XOF', 'USD/SLL', 'USD/GAM',
    'GBP/NGN', 'GBP/GHS', 'GBP/XAF', 'GBP/XOF', 'GBP/SLL', 'GBP/GAM',
    'CAD/NGN', 'CAD/GHS', 'CAD/XAF', 'CAD/XOF', 'CAD/SLL', 'CAD/GAM',
    'EUR/NGN', 'EUR/GHS', 'EUR/XAF', 'EUR/XOF', 'EUR/SLL', 'EUR/GAM'
  ];

  // Sort the rateData to prioritize pairs
  const sortedRateData = Object.entries(rateData).sort(([vendorA], [vendorB]) => {
    const isPriorityA = prioritizedPairs.includes(pair);
    const isPriorityB = prioritizedPairs.includes(pair);

    // If one pair is in the prioritized list and the other isn't
    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;

    // Otherwise, maintain the original order
    return 0;
  });

  return sortedRateData.map(([vendor, rate]) => (
    <TableRow key={`${pair}-${vendor}`}>
      <TableCell>{pair}</TableCell>
      <TableCell>{vendor}</TableCell>
      <TableCell>{rate?.toFixed(2).toLocaleString('en-US') || 'N/A'}</TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={editedRates[pair]?.[vendor].toFixed(2) || ''}
          onChange={(e) => onRateChange(pair, vendor, e.target.value)}
          className="w-32"
        />
      </TableCell>
    </TableRow>
  ));
};
