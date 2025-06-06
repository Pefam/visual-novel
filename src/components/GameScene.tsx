"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { introSequence } from '../data/introScene';
import { choiceScenes } from '../data/choiceScenes';
import { useChoices, type ChoiceType } from '../context/ChoiceContext';

const INITIAL_BACKGROUND = '/images/scenes/plain-bg.png';
const KNOCK_SOUNDS = [
  '/sounds/knock1.mp3',
  '/sounds/knock2.mp3',
  '/sounds/door-open.mp3'
];

type ChoiceScene = typeof choiceScenes[keyof typeof choiceScenes];

const GameScene = () => {
  const { choices, addChoice } = useChoices();
  const [phase, setPhase] = useState<'start' | 'intro' | 'choices' | 'ending'>('start');
  const [currentStep, setCurrentStep] = useState(0);
  const [playerText, setPlayerText] = useState('');
  const [tessaText, setTessaText] = useState('');
  const [currentScene, setCurrentScene] = useState(INITIAL_BACKGROUND);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentChoiceScene, setCurrentChoiceScene] = useState<ChoiceScene>(choiceScenes.firstChoice);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [animatedTessaText, setAnimatedTessaText] = useState('');

  const playSound = useCallback((soundIndex: number) => {
    return new Promise<void>((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(KNOCK_SOUNDS[soundIndex]);
      audioRef.current = audio;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Sound play failed:", e);
          resolve();
        });
      }
      
      const onEnd = () => {
        audio.removeEventListener('ended', onEnd);
        audioRef.current = null;
        resolve();
      };
      
      audio.addEventListener('ended', onEnd);
    });
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
      setPhase('ending');
      setCurrentScene(`/images/scenes/ending${final.number}.png`);
      animateText(final.text, setAnimatedTessaText);
    } else {
      setCurrentChoiceScene(nextScene);
      setCurrentScene(nextScene.scene);
      animateText(nextScene.tessaText, setAnimatedTessaText);
    }
  };

  const waitForContinue = useCallback(() => new Promise<void>(resolve => {
    const handler = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && e.code !== 'Space') return;
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
      resolve();
    };
    window.addEventListener('click', handler);
    window.addEventListener('keydown', handler);
  }), []);

  const startGame = () => {
    setPhase('intro');
    setCurrentStep(0);
  };

  // Run the intro sequence when phase changes to 'intro'
  useEffect(() => {
    let isMounted = true;
    
    const runSequence = async () => {
      if (phase !== 'intro') return;

      if (currentStep === 0) {
        await animateText("Knock, knock knock...", setPlayerText, 50);
        await playSound(0);
        await waitForContinue();
        if (!isMounted) return;
        setPlayerText('');
    
        await animateText("Knock, knock knock...", setPlayerText, 50);
        await playSound(1);
        await waitForContinue();
        if (!isMounted) return;
        setPlayerText('');
        setCurrentScene('/images/scenes/door-open-empty.png');
    
        await animateText("*Door opens*", setPlayerText, 50);
        await playSound(2);
        await waitForContinue();
        if (!isMounted) return;
        setPlayerText('');
        
        setCurrentScene(introSequence[0].scene);
        setCurrentStep(1);
      }

      if (currentStep > 0) {
        const sceneIndex = currentStep - 1;
        const scene = introSequence[sceneIndex];

        await animateText(scene.playerText, setPlayerText);
        await waitForContinue();
        if (!isMounted) return;
        
        setCurrentScene(scene.scene);
        await animateText(scene.tessaText, setTessaText);
        await waitForContinue();
        if (!isMounted) return;
        
        if (currentStep < introSequence.length) {
          setCurrentStep(prev => prev + 1);
        } else {
          setPhase('choices');
          setCurrentScene(choiceScenes.firstChoice.scene);
          animateText(choiceScenes.firstChoice.tessaText, setAnimatedTessaText);
        }
      }
    };

    runSequence();
    
    return () => {
      isMounted = false;
    };
  }, [phase, currentStep, animateText, playSound, waitForContinue]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col bg-black">
      {/* Image Container */}
      <div className="relative w-full flex-1 min-h-[300px] bg-black">
        <div className="relative h-full max-w-4xl mx-auto">
          <Image
            src={currentScene}
            alt="Scene"
            layout="fill"
            objectFit="contain"
            className="object-center transition-opacity duration-500"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Text Container */}
      <div 
        className="bg-black p-4 flex-shrink-0"
        style={{
          height: '40vh',
          minHeight: '250px'
        }}
      >
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          {phase === 'start' ? (
            <div className="h-full flex flex-col items-center justify-center">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xl font-bold transition-all transform hover:scale-105"
              >
                Start Game
              </button>
              <p className="mt-4 text-gray-400 text-sm">
                Click or press space to continue through dialogue
              </p>
            </div>
          ) : phase === 'intro' ? (
            <div className="h-full flex flex-col justify-start">
              <div className="space-y-4">
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
              </div>
            </div>
          ) : phase === 'choices' ? (
            <div className="h-full flex flex-col">
              <div className="flex-grow-0">
                <div className="border-l-4 border-rose-400 pl-2">
                  <p className="text-white text-sm">Tessa:</p>
                  <p className="text-rose-300 text-base italic">
                    {animatedTessaText}
                    {isAnimating && <span className="ml-1 inline-block animate-pulse">|</span>}
                  </p>
                </div>
                
                {!isAnimating && (
                  <div className="mt-4 space-y-2">
                    {currentChoiceScene.choices?.map((choice, index) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoiceSelection(choice, choice.nextSceneId)}
                        className="w-full text-left p-2 rounded transition-all bg-gray-900 hover:bg-cyan-900 border-l-4 border-cyan-600 text-white"
                      >
                        <span className="text-cyan-300 font-bold mr-2">
                          {String.fromCharCode(65 + index)})
                        </span>
                        {choice.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-grow"></div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between">
              <div className="border-l-4 border-rose-400 pl-2">
                <p className="text-white text-sm">Tessa:</p>
                <p className="text-rose-300 text-base italic">
                  {animatedTessaText}
                  {isAnimating && <span className="ml-1 inline-block animate-pulse">|</span>}
                </p>
              </div>
              
              {!isAnimating && (
                <button
                  className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors text-white font-bold mt-4"
                  onClick={() => window.location.reload()}
                >
                  Play Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScene;