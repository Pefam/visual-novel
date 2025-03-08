import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();

  const startGame = () => {
    // We'll add navigation logic later
    console.log('Starting game...');
    router.push('/game'); // Prepare for future routing
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-cyan-400 mb-8 animate-pulse">
        My Visual Novel
      </h1>
      <button
        onClick={startGame}
        className="px-8 py-4 text-2xl font-bold text-white bg-rose-600 rounded-lg 
                 hover:bg-rose-700 transition-all duration-300 transform hover:scale-105"
      >
        Start Journey
      </button>
    </div>
  );
};

export default Home;