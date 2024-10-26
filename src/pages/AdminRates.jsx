import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getRates } from '@/utils/api';
import { AdminRateRow } from '@/components/admin/AdminRateRow';
import { SaveRatesDialog } from '@/components/admin/SaveRatesDialog';

const AdminRates = () => {
  const navigate = useNavigate();
  const [editedRates, setEditedRates] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: rates, isLoading } = useQuery({
    queryKey: ['admin-rates'],
    queryFn: getRates,
  });

  React.useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleRateChange = (pair, vendor, value) => {
    setEditedRates(prev => ({
      ...prev,
      [pair]: {
        ...(prev[pair] || {}),
        [vendor]: value
      }
    }));
  };

  const handleSave = async () => {
    setShowConfirmDialog(false);
    try {
      // Here you would make the API call to save the rates
      toast.success('Rates updated successfully');
    } catch (error) {
      toast.error('Failed to update rates');
    }
  };

  if (isLoading) return <div>Loading...</div>;

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
            {Object.entries(rates?.data || {}).map(([pair, rateData]) => (
              <AdminRateRow
                key={pair}
                pair={pair}
                rateData={rateData}
                editedRates={editedRates}
                onRateChange={handleRateChange}
              />
            ))}
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

export default AdminRates;