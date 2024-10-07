import { HomeIcon, ArrowLeftRightIcon, UserIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import ExchangeRates from "./pages/ExchangeRates.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CurrencyPairAnalysis from "./pages/CurrencyPairAnalysis.jsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Exchange Rates",
    to: "/exchange-rates",
    icon: <ArrowLeftRightIcon className="h-4 w-4" />,
    page: <ExchangeRates />,
  },
  {
    title: "Login",
    to: "/login",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Login />,
  },
  {
    title: "Register",
    to: "/register",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Register />,
  },
  {
    title: "Currency Pair Analysis",
    to: "/currency-pair/:pair",
    icon: <ArrowLeftRightIcon className="h-4 w-4" />,
    page: <CurrencyPairAnalysis />,
  },
];