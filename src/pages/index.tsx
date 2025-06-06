// pages/game.tsx
import { ChoiceProvider } from '../context/ChoiceContext';
import GameScene from '../components/GameScene';

const GamePage = () => {
  return (
    <ChoiceProvider>
      <GameScene />
    </ChoiceProvider>
  );
};

export default GamePage;