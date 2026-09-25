import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

/* -------------------------------------------------------
   VELoop Game Economy — Centralized State
   Demo state only. Clearly labeled as such throughout.
   A future backend boundary should authorise all
   deductions, rewards, and redemptions server-side.
   ------------------------------------------------------- */

const STORAGE_KEY = 'veloop_game_state_v4';

const DEFAULT_USER = {
  isLoggedIn: true,
  name: 'Alex Morgan',
  username: 'alex_veloop',
  email: 'alex.morgan@veloop.io',
  avatar: 'sports_esports',
  avatarGradient: 'linear-gradient(135deg, #2563eb, #38bdf8)',
  vipLevel: 4,
  vipTier: 'Gold Tier',
  xp: 7450,
  xpNext: 10000,
  bio: 'Arcade champion & high-score hunter. Competing across Blade Master and Block Crush tournaments!',
  country: 'United States',
  joinedDate: 'November 2024',
  soundEnabled: true,
  notificationsEnabled: true,
  stats: {
    matchesPlayed: 84,
    gamesWon: 62,
    highestScore: 18450,
    tournamentsWon: 5,
  },
};

const DEFAULT_STATE = {
  tokenBalance: 120,
  coinBalance: 14850,
  guideAcknowledged: {},   // { [gameId]: true }
  redemptionHistory: [],   // [{ id, category, amount, coins, timestamp }]
  sessionResults: [],      // recent game results
  user: DEFAULT_USER,
};

function loadState() {
  try {
    // Check v4 first, fallback to v3 migration
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('veloop_game_state_v3');
    }
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (typeof parsed.tokenBalance !== 'number') return DEFAULT_STATE;
    // Guarantee minimum 60 tokens so demo testing never locks out
    const tokenBalance = Math.max(parsed.tokenBalance, 60);
    const user = {
      ...DEFAULT_USER,
      ...(parsed.user || {}),
      stats: {
        ...DEFAULT_USER.stats,
        ...((parsed.user && parsed.user.stats) || {}),
      },
    };
    return { ...DEFAULT_STATE, ...parsed, tokenBalance, user };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ---- Reducer ----
function reducer(state, action) {
  switch (action.type) {
    case 'DEDUCT_TOKENS': {
      if (state.tokenBalance < action.amount) return state;
      return { ...state, tokenBalance: state.tokenBalance - action.amount };
    }
    case 'ADD_TOKENS': {
      return { ...state, tokenBalance: state.tokenBalance + action.amount };
    }
    case 'ADD_COINS': {
      return { ...state, coinBalance: state.coinBalance + action.amount };
    }
    case 'ACKNOWLEDGE_GUIDE': {
      return {
        ...state,
        guideAcknowledged: { ...state.guideAcknowledged, [action.gameId]: true },
      };
    }
    case 'RESET_GUIDE': {
      const copy = { ...state.guideAcknowledged };
      delete copy[action.gameId];
      return { ...state, guideAcknowledged: copy };
    }
    case 'RECORD_RESULT': {
      const results = [action.result, ...state.sessionResults].slice(0, 15);
      // Increment user matches played and check highest score
      const currentHighest = state.user?.stats?.highestScore || 0;
      const newScore = action.result?.score || 0;
      const updatedStats = {
        ...(state.user?.stats || DEFAULT_USER.stats),
        matchesPlayed: ((state.user?.stats?.matchesPlayed || 0) + 1),
        highestScore: Math.max(currentHighest, newScore),
      };
      return {
        ...state,
        sessionResults: results,
        user: {
          ...state.user,
          stats: updatedStats,
          xp: Math.min((state.user?.xp || 0) + 75, state.user?.xpNext || 10000),
        },
      };
    }
    case 'REDEEM': {
      const { id, category, label, coinsSpent, unitsReceived, timestamp } = action;
      if (state.coinBalance < coinsSpent) return state;
      const entry = { id, category, label, coinsSpent, unitsReceived, timestamp };
      const history = [entry, ...state.redemptionHistory].slice(0, 20);
      return {
        ...state,
        coinBalance: state.coinBalance - coinsSpent,
        redemptionHistory: history,
      };
    }
    case 'LOGIN': {
      const { email, name, username, avatar } = action.payload || {};
      return {
        ...state,
        user: {
          ...state.user,
          isLoggedIn: true,
          email: email || state.user.email,
          name: name || (email ? email.split('@')[0] : state.user.name),
          username: username || (email ? email.split('@')[0].toLowerCase() : state.user.username),
          avatar: avatar || state.user.avatar,
        },
      };
    }
    case 'SIGNUP': {
      const { name, username, email, avatar, avatarGradient } = action.payload || {};
      return {
        ...state,
        tokenBalance: state.tokenBalance + 50, // Welcome signup bonus
        coinBalance: state.coinBalance + 500,  // Welcome signup bonus
        user: {
          ...DEFAULT_USER,
          isLoggedIn: true,
          name: name || 'New Player',
          username: username || 'player_veloop',
          email: email || 'player@veloop.io',
          avatar: avatar || 'sports_esports',
          avatarGradient: avatarGradient || 'linear-gradient(135deg, #7c3aed, #c084fc)',
          vipLevel: 1,
          vipTier: 'Bronze Tier',
          xp: 250,
          xpNext: 1000,
          bio: 'Ready to play, earn, and level up with VELoop Rewards!',
          joinedDate: 'Just now',
          stats: {
            matchesPlayed: 0,
            gamesWon: 0,
            highestScore: 0,
            tournamentsWon: 0,
          },
        },
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        user: {
          ...state.user,
          isLoggedIn: false,
        },
      };
    }
    case 'UPDATE_PROFILE': {
      return {
        ...state,
        user: {
          ...state.user,
          ...(action.payload || {}),
        },
      };
    }
    case 'RESET_DEMO': {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

// ---- Context ----
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // ---- Actions ----
  const deductTokens = useCallback((amount = 20) => {
    if (state.tokenBalance < amount) return false;
    dispatch({ type: 'DEDUCT_TOKENS', amount });
    return true;
  }, [state.tokenBalance]);

  const addTokens = useCallback((amount = 50) => {
    dispatch({ type: 'ADD_TOKENS', amount });
  }, []);

  const addCoins = useCallback((amount) => {
    dispatch({ type: 'ADD_COINS', amount });
  }, []);

  const acknowledgeGuide = useCallback((gameId) => {
    dispatch({ type: 'ACKNOWLEDGE_GUIDE', gameId });
  }, []);

  const resetGuide = useCallback((gameId) => {
    dispatch({ type: 'RESET_GUIDE', gameId });
  }, []);

  const recordResult = useCallback((result) => {
    dispatch({ type: 'RECORD_RESULT', result });
  }, []);

  const redeem = useCallback(({ id, category, label, coinsSpent, unitsReceived }) => {
    if (state.coinBalance < coinsSpent) return false;
    dispatch({
      type: 'REDEEM',
      id: id || `redeem-${Date.now()}`,
      category,
      label,
      coinsSpent,
      unitsReceived,
      timestamp: new Date().toISOString(),
    });
    return true;
  }, [state.coinBalance]);

  const login = useCallback((payload) => {
    dispatch({ type: 'LOGIN', payload });
  }, []);

  const signup = useCallback((payload) => {
    dispatch({ type: 'SIGNUP', payload });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback((payload) => {
    dispatch({ type: 'UPDATE_PROFILE', payload });
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_DEMO' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        // State
        tokenBalance: state.tokenBalance,
        coinBalance: state.coinBalance,
        guideAcknowledged: state.guideAcknowledged,
        redemptionHistory: state.redemptionHistory,
        sessionResults: state.sessionResults,
        user: state.user,
        // Actions
        deductTokens,
        addTokens,
        addCoins,
        acknowledgeGuide,
        resetGuide,
        recordResult,
        redeem,
        login,
        signup,
        logout,
        updateProfile,
        resetDemo,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within <GameProvider>');
  return ctx;
}
