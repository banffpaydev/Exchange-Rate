import { lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ExchangeRates = lazy(() => import("./pages/ExchangeRates"));
const TapExchangeRates = lazy(() => import("./pages/TapExchangeRates"));
const CurrencyPairAnalysis = lazy(() => import("./pages/CurrencyPairAnalysis"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const HeatmapDashboard = lazy(() => import("./pages/HeatmapDashboard"));

export const navItems = [
  {
    title: "Dashboard",
    to: "/",
    page: <Dashboard />
  },
  {
    title: "Heatmap",
    to: "/heatmap",
    page: <HeatmapDashboard />
  },
  {
    title: "Exchange Rates",
    to: "/exchange-rates",
    page: <ExchangeRates />
  },
  {
    title: "Historical Rates",
    to: "/historical-rates",
    page: <TapExchangeRates />
  },
  {
    title: "Login",
    to: "/login",
    page: <Login />
  },
  {
    title: "Register",
    to: "/register",
    page: <Register />
  }
];

// Add a route that won't show in navigation
export const hiddenRoutes = [
  {
    to: "/currency-pair/:pairs",
    page: <CurrencyPairAnalysis />
  }
];