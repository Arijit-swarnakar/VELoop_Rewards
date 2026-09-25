import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GameHomePage from './pages/GameHomePage';
import GameInstructionsPage from './pages/GameInstructionsPage';
import GamePlayPage from './pages/GamePlayPage';
import RedeemPage from './pages/RedeemPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content" role="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:gameId" element={<GameHomePage />} />
          <Route path="/games/:gameId/instructions" element={<GameInstructionsPage />} />
          <Route path="/games/:gameId/play" element={<GamePlayPage />} />
          <Route path="/rewards" element={<RedeemPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;