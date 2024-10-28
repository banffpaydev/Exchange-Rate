import React from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong!</AlertTitle>
      <AlertDescription className="mt-2">
        {error.message}
        <Button
          variant="outline"
          className="mt-4"
          onClick={resetErrorBoundary}
        >
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
};