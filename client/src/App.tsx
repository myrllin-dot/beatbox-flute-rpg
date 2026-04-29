import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Village from "./pages/Village";
import Quests from "./pages/Quests";
import QuestDetail from "./pages/QuestDetail";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import InstructorDashboard from "./pages/InstructorDashboard";
import Leaderboard from "./pages/Leaderboard";
import CheckIn from "./pages/CheckIn";
import Community from "./pages/Community";
import ReminderSettings from "./pages/ReminderSettings";
import Challenges from "./pages/Challenges";
import LearningPath from "./pages/LearningPath";
import Booking from "./pages/Booking";
import InstructorBooking from "./pages/InstructorBooking";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/village" component={Village} />
      <Route path="/quests" component={Quests} />
      <Route path="/quests/:id" component={QuestDetail} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route path="/instructor" component={InstructorDashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/checkin" component={CheckIn} />
      <Route path="/community" component={Community} />
      <Route path="/reminders" component={ReminderSettings} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/learning-path" component={LearningPath} />
      <Route path="/booking" component={Booking} />
      <Route path="/instructor/booking" component={InstructorBooking} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
