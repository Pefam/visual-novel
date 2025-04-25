"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { introSequence } from '../data/introScene';
import { choiceScenes } from '../data/choiceScenes';
import { useChoices, type ChoiceType } from '../context/ChoiceContext';

const MIN_IMAGE_HEIGHT = 300;
const INITIAL_BACKGROUND = '/images/scenes/plain-bg.png';
const KNOCK_SOUNDS = [
  '/sounds/knock1.mp3',
  '/sounds/knock2.mp3',
  '/sounds/door-open.mp3'
];

type ChoiceScene = typeof choiceScenes[keyof typeof choiceScenes];

const GameScene = () => {
  const { choices, addChoice } = useChoices();
  const [phase, setPhase] = useState<'intro' | 'choices' | 'ending'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [playerText, setPlayerText] = useState('');
  const [tessaText, setTessaText] = useState('');
  const [currentScene, setCurrentScene] = useState(INITIAL_BACKGROUND);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentChoiceScene, setCurrentChoiceScene] = useState<ChoiceScene>(choiceScenes.firstChoice);
  const [endingText, setEndingText] = useState('');

  const playSound = useCallback((soundIndex: number) => {
    const audio = new Audio(KNOCK_SOUNDS[soundIndex]);
    audio.play();
  }, []);

  const animateText = useCallback(async (text: string, setText: React.Dispatch<React.SetStateAction<string>>, delay = 100) => {
    setIsAnimating(true);
    const words = text.split(' ');
    let current = '';
    
    for (const word of words) {
      current += (current ? ' ' : '') + word;
      setText(current);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setIsAnimating(false);
  }, []);

  const determineEnding = (choices: ChoiceType[]): { text: string, number: number } => {
    const choiceIds = choices.map(c => c.id);
    
    if (choiceIds.includes('1A') && choiceIds.includes('2A') && choiceIds.includes('3A')) 
      return { text: "I guess you should go now.", number: 1 };
    if (choiceIds.includes('1C') && choiceIds.includes('2C') && choiceIds.includes('3C')) 
      return { text: "Sometimes I feel like I'm invisible at home... like they wouldn't even notice if I disappeared.", number: 5 };
    
    const ending2Base = (choiceIds.includes('1A') || choiceIds.includes('1B')) &&
      (choiceIds.includes('2A') || choiceIds.includes('2B')) &&
      (choiceIds.includes('3A') || choiceIds.includes('3B'));
    const ending2Exclusion = !(choiceIds.includes('1A') && choiceIds.includes('2A') && choiceIds.includes('3A'));
    if (ending2Base && ending2Exclusion) return { text: "Yeah, it never changes.", number: 2 };
    
    const ending4Base = (choiceIds.includes('1B') || choiceIds.includes('1C')) &&
      (choiceIds.includes('2B') || choiceIds.includes('2C')) &&
      (choiceIds.includes('3B') || choiceIds.includes('3C'));
    const ending4Exclusion = !(choiceIds.includes('1C') && choiceIds.includes('2C') && choiceIds.includes('3C'));
    if (ending4Base && ending4Exclusion) return { text: "Thanks... no one ever really listens.", number: 4 };
    
    return { text: "Well, I guess that's it, then.", number: 3 };
  };

  const handleChoiceSelection = (
    choice: { id: string; type: 'A' | 'B' | 'C' }, 
    nextSceneId: string
  ) => {
    const updatedChoices = [...choices, { id: choice.id, type: choice.type }];
    addChoice({ id: choice.id, type: choice.type });

    const nextScene = choiceScenes[nextSceneId];
    if (!nextScene) return;

    if (nextScene.isEnding) {
      const final = determineEnding(updatedChoices);
      setEndingText(final.text);
      setPhase('ending');
      setCurrentScene(`/images/scenes/ending${final.number}.png`);
    } else {
      setCurrentChoiceScene(nextScene);
      setCurrentScene(nextScene.scene);
    }
  };

  const waitForContinue = () => new Promise<void>(resolve => {
    const handler = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && e.code !== 'Space') return;
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
      resolve();
    };
    window.addEventListener('click', handler);
    window.addEventListener('keydown', handler);
  });

  useEffect(() => {
    let isMounted = true;
    
    const runSequence = async () => {

      // Initial knock sequence
      if (currentStep === 0) {
        // First knock
        playSound(0);
        await animateText("Knock, knock knock...", setPlayerText, 50);
        
        // Wait for user to continue
        await waitForContinue();
        setPlayerText('');
    
        // Second knock
        playSound(1);
        await animateText("Knock, knock knock...", setPlayerText, 50);
        
        // Wait for user to continue
        await waitForContinue();
        setPlayerText('');
        setCurrentScene('/images/scenes/door-open-empty.png');
    
        // Door opening
        playSound(2);
        await animateText("*Door opens*", setPlayerText, 50);
        
        // Wait for user to continue
        await waitForContinue();
        setPlayerText('');
        
        // Transition to first scene
        setCurrentScene(introSequence[0].scene);
        setCurrentStep(1);
      }

      // Main dialogue sequence
      if (currentStep > 0) {
        const sceneIndex = currentStep - 1;
        const scene = introSequence[sceneIndex];

        // Animate player text
        await animateText(scene.playerText, setPlayerText);
        
        // Wait for user to continue
        const waitForContinue = () => new Promise<void>(resolve => {
          const handler = (e: KeyboardEvent | MouseEvent) => {
            if (e instanceof KeyboardEvent && e.code !== 'Space') return;
            window.removeEventListener('click', handler);
            window.removeEventListener('keydown', handler);
            resolve();
          };
          window.addEventListener('click', handler);
          window.addEventListener('keydown', handler);
        });
        
        await waitForContinue();
        
        if (!isMounted) return;
        
        // Update scene and animate Tessa's response
        setCurrentScene(scene.scene);
        await animateText(scene.tessaText, setTessaText);
        
        await waitForContinue();
        
        if (isMounted) {
          if (currentStep < introSequence.length) {
            setCurrentStep(prev => prev + 1);
          } else {
            setPhase('choices');
            setCurrentScene(choiceScenes.firstChoice.scene);
          }
        }
      }
    };

    runSequence();
    return () => { isMounted = false; };
  }, [currentStep]);

  return (
    <div className="relative h-screen w-full flex flex-col bg-gray-900">
      {/* Image Container - No changes here */}
      <div className="relative w-full flex-1 min-h-[300px]">
        <div className="relative h-full max-w-4xl mx-auto">
          <Image
            src={currentScene}
            alt="Scene"
            layout="fill"
            objectFit="contain"
            className="object-center transition-opacity duration-500"
            priority
          />
        </div>
      </div>

      {/* Fixed-height Text Container - Critical changes here */}
      <div 
        className="bg-black/80 p-4 flex-shrink-0"
        style={{
          height: '40vh',
          minHeight: '250px'
        }}
      >
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-between">
          {phase === 'intro' ? (
            <>
              {playerText && (
                <div className="border-l-4 border-cyan-400 pl-2">
                  <p className="text-white text-sm">You:</p>
                  <p className="text-cyan-300 text-base">{playerText}</p>
                </div>
              )}
              {tessaText && (
                <div className="border-l-4 border-rose-400 pl-2">
                  <p className="text-white text-sm">Tessa:</p>
                  <p className="text-rose-300 text-base italic">{tessaText}</p>
                </div>
              )}
              {/* Spacer to maintain height */}
              {!tessaText && <div className="flex-1" />}
            </>
          ) : phase === 'choices' ? (
            <div className="h-full flex flex-col justify-between">
              <div className="border-l-4 border-rose-400 pl-2">
                <p className="text-white text-sm">Tessa:</p>
                <p className="text-rose-300 text-base italic">{currentChoiceScene.tessaText}</p>
              </div>
              <div className="space-y-2">
                {currentChoiceScene.choices?.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelection(choice, choice.nextSceneId)}
                    className="w-full text-left p-2 rounded transition-all bg-black/40 hover:bg-cyan-800/30 border-l-4 border-transparent hover:border-cyan-500"
                  >
                    <span className="text-cyan-300 mr-2">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between">
              <div className="border-l-4 border-rose-400 pl-2">
                <p className="text-white text-sm">Tessa:</p>
                <p className="text-rose-300 text-base italic">{endingText}</p>
              </div>
              <button
                className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors text-white font-bold"
                onClick={() => window.location.reload()}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScene;