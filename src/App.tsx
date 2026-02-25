import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Service3DAR from "./pages/services/Service3DAR";
import ServiceAgents from "./pages/services/ServiceAgents";
import ServiceChatbots from "./pages/services/ServiceChatbots";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import AgentsPage from "./pages/agents/Agents";
import AgentDetailPage from "./pages/agents/AgentDetail";
import AgentFrameworkIndexPage from "./pages/agents/AgentFrameworkIndex";
import AgentIndustryIndexPage from "./pages/agents/AgentIndustryIndex";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ThemeProvider>
            <SmoothScrollProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/3d-ar-modelling" element={<Service3DAR />} />
                <Route path="/services/ai-agents" element={<ServiceAgents />} />
                <Route path="/services/ai-agents-langgraph" element={<Navigate to="/services/ai-agents" replace />} />
                <Route path="/services/custom-ai-chatbots" element={<ServiceChatbots />} />
                <Route path="/work" element={<Work />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/agents/page/:pageNumber" element={<AgentsPage />} />
                <Route path="/agents/:slug" element={<AgentDetailPage />} />
                <Route path="/agents/frameworks/:framework" element={<AgentFrameworkIndexPage />} />
                <Route path="/agents/industry/:industry" element={<AgentIndustryIndexPage />} />
                <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/legal/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SmoothScrollProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
