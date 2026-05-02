import React from 'react';
import { createRoot } from 'react-dom/client';
import DashboardScreen from './app/(tabs)/index';
import { AIChatFAB } from './components/AIChatFAB';
import './global.css';

// Mock Auth Context or Provider if needed, but AIChatFAB checks 'user'
// For preview purposes, I'll bypass the null check in FAB or provide a mock
const App = () => {
  return (
    <div className="dark min-h-full">
      <DashboardScreen />
      {/* Forcing FAB to show in preview since we aren't logged in here */}
      <div className="absolute bottom-24 right-6 bg-indigo-600 w-16 h-16 rounded-3xl items-center justify-center shadow-xl shadow-indigo-500/50">
        <span className="text-white text-3xl">✨</span>
        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-indigo-600"></div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
