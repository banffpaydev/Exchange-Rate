import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Currency Exchange App</h1>
        <p className="text-xl text-gray-600 mb-8">Check exchange rates or log in to your account</p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/exchange-rates">View Exchange Rates</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;