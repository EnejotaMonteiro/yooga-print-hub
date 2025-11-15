import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import PrintersPage from "./pages/PrintersPage";
import FAQPage from "./pages/FAQPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import WikiPage from "./pages/WikiPage";
import GeneralChatPage from "./pages/GeneralChatPage";
import { Sidebar } from "./components/Sidebar";

const queryClient = new QueryClient();

// Layout component for pages with sidebar
const LayoutWithSidebar = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <main className="flex-1 md:ml-64"> {/* Adjust margin for sidebar width */}
      <Outlet /> {/* Renders the matched child route */}
    </main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} /> {/* Admin page without sidebar */}
            
            <Route element={<LayoutWithSidebar />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/printers" element={<PrintersPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/wiki" element={<WikiPage />} />
              <Route path="/chat-geral" element={<GeneralChatPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;