import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Memories from "@/pages/memories";
import Family from "@/pages/family";
import NotFound from "@/pages/not-found";
import Photos from "@/pages/photos";
import SharedMemory from "@/pages/shared-memory";
import PrivacyDemo from "@/pages/privacy-demo";
import ThoughtfulDemo from "@/pages/thoughtful-demo";
import LifeEvents from "@/pages/life-events";
import ReligiousMemories from "@/pages/religious-memories";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/memories" component={Memories} />
      <Route path="/family" component={Family} />
      <Route path="/photos" component={Photos} />
      <Route path="/shared" component={SharedMemory} />
      <Route path="/privacy" component={PrivacyDemo} />
      <Route path="/life-events" component={LifeEvents} />
      <Route path="/thoughtful-questions" component={ThoughtfulDemo} />
      <Route path="/religious-memories" component={ReligiousMemories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
