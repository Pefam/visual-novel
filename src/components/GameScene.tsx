"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { introSequence } from '../data/introScene';
import { choiceScenes } from '../data/choiceScenes';
import { useChoices, type ChoiceType } from '../context/ChoiceContext';

const MIN_IMAGE_HEIGHT = 300;
const MIN_TEXT_HEIGHT = 200;
const INITIAL_BACKGROUND = '/images/scenes/plain-bg.png';

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

  useEffect(() => {
    const preloadImages = [
      INITIAL_BACKGROUND,
      ...introSequence.map(scene => scene.scene),
      ...Object.values(choiceScenes)
        .filter(scene => !scene.isEnding)
        .map(scene => scene.scene),
      ...Array.from({ length: 5 }, (_, i) => `/images/scenes/ending${i + 1}.png`)
    ];

    preloadImages.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
    });
  }, []);

  const animateText = useCallback(async (text: string, setText: React.Dispatch<React.SetStateAction<string>>) => {
    setIsAnimating(true);
    const words = text.split(' ');
    let current = '';
    
    for (const word of words) {
      current += (current ? ' ' : '') + word;
      setText(current);
      await new Promise(resolve => setTimeout(resolve, 100));
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

  useEffect(() => {
    let isMounted = true;
    
    const runSequence = async () => {
      if (currentStep === 0) {
        const waitForStart = () => new Promise<void>(resolve => {
          const handler = (e: KeyboardEvent | MouseEvent) => {
            if (e instanceof KeyboardEvent && e.code !== 'Space') return;
            window.removeEventListener('click', handler);
            window.removeEventListener('keydown', handler);
            resolve();
          };
          window.addEventListener('click', handler);
          window.addEventListener('keydown', handler);
        });
        
        await waitForStart();
        setCurrentScene(introSequence[0].scene);
      }

      if (currentStep > 0) {
        setPlayerText('');
        setTessaText('');
      }
      
      await animateText(introSequence[currentStep].playerText, setPlayerText);
      
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
      
      setCurrentScene(introSequence[currentStep].scene);
      await animateText(introSequence[currentStep].tessaText, setTessaText);
      
      await waitForContinue();
      
      if (isMounted) {
        if (currentStep < introSequence.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setPhase('choices');
          setCurrentScene(choiceScenes.firstChoice.scene);
        }
      }
    };

    runSequence();
    return () => { isMounted = false; };
  }, [currentStep]);

  return (
    <div className="relative h-screen w-full flex flex-col">
    {/* Image Container */}
    <div className="relative w-full flex-1 min-h-[300px]">
      <div className="relative h-full max-w-4xl mx-auto">
        <Image
          src={currentScene}
          alt="Scene"
          layout="fill"
          objectFit="contain"
          className="object-center"
          priority
        />
      </div>
    </div>

    <div className="bg-black/80 p-4 overflow-y-auto flex-shrink-0 min-h-[200px]">
        <div className="max-w-2xl mx-auto space-y-2">
          {phase === 'intro' ? (
            <>
              <div className="border-l-4 border-cyan-400 pl-2">
                <p className="text-white text-sm">You:</p>
                <p className="text-cyan-300 text-base">{playerText}</p>
              </div>
              {tessaText && (
                <div className="border-l-4 border-rose-400 pl-2">
                  <p className="text-white text-sm">Tessa:</p>
                  <p className="text-rose-300 text-base italic">{tessaText}</p>
                </div>
              )}
            </>
          ) : phase === 'choices' ? (
            <>
              <div className="border-l-4 border-rose-400 pl-2">
                <p className="text-white text-sm">Tessa:</p>
                <p className="text-rose-300 text-base italic">{currentChoiceScene.tessaText}</p>
              </div>
              <div className="space-y-2">
                {currentChoiceScene.choices?.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelection(choice, choice.nextSceneId)}
                    className="w-full text-left p-2 rounded transition-all bg-black/40 hover:bg-cyan-800/30 border-l-4 border-transparent"
                  >
                    <span className="text-cyan-300 mr-2">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {choice.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
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