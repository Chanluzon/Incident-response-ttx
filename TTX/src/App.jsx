import { Route, BrowserRouter, Routes } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./App.css";
import bgMusic from "./audio/bg-music.mp3";

// Pages
import Landing from "./pages/dashboard/landing";
import SetUp from "./pages/dashboard/dashboardFeatures/setup";
import Dashboard from "./pages/dashboard/dashboardFeatures/dashboard";
import GameInstructions from "./pages/dashboard/dashboardFeatures/gameInstructions";
import TTXGame from "./pages/dashboard/dashboardFeatures/startgame";
import RegisterPage from "./pages/moderator/registerPage";
import LoginPage from "./pages/moderator/loginPage";
import ModeratorDashboard from "./pages/moderator/dashboard/moderatorDashboard";
import GameList from "./pages/dashboard/dashboardFeatures/gameList";
import PreviewBoard from "./pages/dashboard/dashboardFeatures/previewBoard";

function App() {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    // Set volume to 50%
    audio.volume = 0.1;

    const playAudio = () => {
      audio.play().catch(() => {});
    };

    document.addEventListener("click", playAudio);

    return () => {
      document.removeEventListener("click", playAudio);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Background Music */}
      <audio ref={audioRef} src={bgMusic} loop autoPlay />

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />
        <Route path="/SetUp" element={<SetUp />} />

        {/* Moderator */}
        <Route path="/moderator/register" element={<RegisterPage />} />
        <Route path="/moderator" element={<LoginPage />} />
        <Route path="/moderator/dashboard" element={<ModeratorDashboard />} />

        {/* Dashboard Page */}
        <Route path="/Dashboard">
          <Route index element={<Dashboard />} />
          <Route path="GameInstructions" element={<GameInstructions />} />
        </Route>

        <Route path="/GameList" element={<GameList />} />
        <Route path="/PreviewBoard" element={<PreviewBoard />} />
        <Route path="/TTXGame" element={<TTXGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
