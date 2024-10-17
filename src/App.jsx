import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { navItems } from "./nav-items";

const queryClient = new QueryClient();

const Layout = ({ children }) => {

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <nav>
          <ul className="flex space-x-4">
            {navItems.map(({ title, to }) => (
              <li key={to}>
                <Link to={to} className="hover:text-gray-300">{title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
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
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

