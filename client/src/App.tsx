import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Reader from "@/pages/reader";
import { ThemeProvider } from "@/hooks/use-dark-mode";
import { ReaderProvider } from "@/hooks/use-reader";
import { FontSizeProvider } from "@/hooks/use-font-size";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reader/:id" component={Reader} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FontSizeProvider>
          <ReaderProvider>
            <Router />
            <Toaster />
          </ReaderProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
