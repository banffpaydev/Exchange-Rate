import { Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { navItems } from "./nav-items";
import { ErrorFallback } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      suspense: true,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const Layout = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
        <nav>
          <ul className="flex space-x-4">
            {navItems
              .filter((item) => {
                if (isLoggedIn) {
                  // Exclude "Register" and "Login" when logged in
                  return (
                    item.title.toLowerCase() !== "register" &&
                    item.title.toLowerCase() !== "login"
                  );
                } else {
                  return item.title.toLowerCase() !== "logout";
                }
              })
              .map(
                ({ title, to }) =>
                  title && (
                    <li key={to}>
                      <Link to={to} className="hover:text-gray-300">
                        {title}
                      </Link>
                    </li>
                  )
              )}
          </ul>
        </nav>
      </header>
      <main className="flex-grow">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Layout>
          <Routes>
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
