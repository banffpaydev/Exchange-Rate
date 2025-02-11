import { Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { navItems } from "./nav-items";
import { ErrorFallback } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { getUser } from "./utils/api";
import { useStore } from "../store/store";
import { adminUsers } from "./pages/AdminRates copy";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        const response = await getUser();
        setUser(response.data);
      }
      setLoggedIn(!!token);
    };
    fetchUserData();
  }, [location]);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
        <nav>
          <ul className="flex space-x-4">
            {navItems
              .filter((item) => {
                if (isLoggedIn) {
                  if (!adminUsers.includes(user?.type)) {
                    // Show only items relevant to admins when the user is an admin
                    return (
                      item.title.toLowerCase() !== "register" &&
                      item.title.toLowerCase() !== "login" &&
                      item.title.toLowerCase() !== "admin"
                    );
                  }

                  // Exclude "Register" and "Login" when logged in
                  return (
                    item.title.toLowerCase() !== "register" &&
                    item.title.toLowerCase() !== "login"
                  );
                } else {
                  return (
                    item.title.toLowerCase() !== "admin" &&
                    item.title.toLowerCase() !== "logout"
                  );
                }
              })
              .map(
                ({ title, to, action }) =>
                  title && (
                    <li key={to}>
                      {title.toLowerCase() === "logout" ? (
                        <button
                          onClick={() => {
                            action();
                            navigate("/login");
                          }}
                          className="hover:text-gray-300"
                        >
                          {title}
                        </button>
                      ) : (
                        <Link to={to} className="hover:text-gray-300">
                          {title}
                        </Link>
                      )}
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
