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
import AIChatPage from "./pages/AIChatPage";
import UtilitiesPage from "./pages/UtilitiesPage";
import ScalesPage from "./pages/ScalesPage"; // Importar a nova página de Balanças
import ResetPassword from "./pages/ResetPassword";
import { Sidebar } from "./components/Sidebar";
import { HiddenInfoProvider } from "./contexts/HiddenInfoContext"; // Importar o provedor de contexto

const queryClient = new QueryClient();

// Layout component for pages with sidebar
const LayoutWithSidebar = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <main className="flex-1 pl-20 h-screen"> {/* Removido py-8 */}
      <Outlet /> {/* Renders the matched child route */}
    </main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" attribute="class">
      <TooltipProvider>
        <Sonner /> {/* Usando apenas o Toaster do Sonner */}
        <BrowserRouter>
          <HiddenInfoProvider> {/* Envolvendo a aplicação com o provedor */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} /> {/* Admin page without sidebar */}
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route element={<LayoutWithSidebar />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/printers" element={<PrintersPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/suggestions" element={<SuggestionsPage />} />
                <Route path="/wiki" element={<WikiPage />} />
                <Route path="/ai-chat" element={<AIChatPage />} />
                <Route path="/utilities" element={<UtilitiesPage />} />
                <Route path="/scales" element={<ScalesPage />} /> {/* Nova rota para Balanças */}
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HiddenInfoProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;