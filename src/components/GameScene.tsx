"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { introSequence } from '../data/introScene';
import { choiceScenes } from '../data/choiceScenes';
import { useChoices, type ChoiceType } from '../context/ChoiceContext';

const MIN_IMAGE_HEIGHT = 300;
const MIN_TEXT_HEIGHT = 200;
const CHARACTER_SIZE_PERCENTAGE = 60;

type ChoiceScene = typeof choiceScenes[keyof typeof choiceScenes];

const GameScene = () => {
  const { choices, addChoice } = useChoices();
  const [phase, setPhase] = useState<'intro' | 'choices' | 'ending'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [playerText, setPlayerText] = useState('');
  const [tessaText, setTessaText] = useState('');
  const [currentPose, setCurrentPose] = useState(introSequence[0].pose);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentChoiceScene, setCurrentChoiceScene] = useState<ChoiceScene>(choiceScenes.firstChoice);
  const [endingText, setEndingText] = useState('');

  // Image preloading
  useEffect(() => {
    const allScenes = [
      ...introSequence,
      ...Object.values(choiceScenes)
    ];
    
    allScenes.forEach(scene => {
      const img = document.createElement('img');
      img.src = scene.pose;
    });
    
    const bgImg = document.createElement('img');
    bgImg.src = '/images/backgrounds/house-front.png';
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

  const determineEnding = (choices: ChoiceType[]): string => {
    const choiceIds = choices.map(c => c.id);
    console.log('[DEBUG] All choice IDs:', choiceIds);
    
    // Ending 1: 1A-2A-3A
    const ending1Condition = 
      choiceIds.includes('1A') && 
      choiceIds.includes('2A') && 
      choiceIds.includes('3A');
    console.log('[DEBUG] Ending 1 check (1A-2A-3A):', ending1Condition);
    if (ending1Condition) return "I guess you should go now.";
  
    // Ending 5: 1C-2C-3C
    const ending5Condition = 
      choiceIds.includes('1C') && 
      choiceIds.includes('2C') && 
      choiceIds.includes('3C');
    console.log('[DEBUG] Ending 5 check (1C-2C-3C):', ending5Condition);
    if (ending5Condition) return "Sometimes I feel like I'm invisible at home... like they wouldn't even notice if I disappeared.";
  
    // Ending 2: (1A|1B) + (2A|2B) + (3A|3B) but not 1A-2A-3A
    const ending2Base = 
      (choiceIds.includes('1A') || choiceIds.includes('1B')) &&
      (choiceIds.includes('2A') || choiceIds.includes('2B')) &&
      (choiceIds.includes('3A') || choiceIds.includes('3B'));
    const ending2Exclusion = 
      !(choiceIds.includes('1A') && choiceIds.includes('2A') && choiceIds.includes('3A'));
    const ending2Condition = ending2Base && ending2Exclusion;
    console.log(
      '[DEBUG] Ending 2 check - Base:', ending2Base,
      'Exclusion:', ending2Exclusion,
      'Total:', ending2Condition
    );
    if (ending2Condition) return "Yeah, it never changes.";
  
    // Ending 4: (1B|1C) + (2B|2C) + (3B|3C) but not 1C-2C-3C
    const ending4Base = 
      (choiceIds.includes('1B') || choiceIds.includes('1C')) &&
      (choiceIds.includes('2B') || choiceIds.includes('2C')) &&
      (choiceIds.includes('3B') || choiceIds.includes('3C'));
    const ending4Exclusion = 
      !(choiceIds.includes('1C') && choiceIds.includes('2C') && choiceIds.includes('3C'));
    const ending4Condition = ending4Base && ending4Exclusion;
    console.log(
      '[DEBUG] Ending 4 check - Base:', ending4Base,
      'Exclusion:', ending4Exclusion,
      'Total:', ending4Condition
    );
    if (ending4Condition) return "Thanks... no one ever really listens.";
  
    // Ending 3: Default
    console.log('[DEBUG] No specific ending matched, falling back to Ending 3');
    return "Well, I guess that's it, then.";
  };

const handleChoiceSelection = (
  choice: { id: string; type: 'A' | 'B' | 'C' }, 
  nextSceneId: string
) => {
  // Create temporary updated choices array
  const updatedChoices = [...choices, { id: choice.id, type: choice.type }];
  
  // Update context state
  addChoice({ id: choice.id, type: choice.type });

  const nextScene = choiceScenes[nextSceneId];
  if (!nextScene) return;

  if (nextScene.isEnding) {
    // Use the temporary updated choices array
    const finalText = determineEnding(updatedChoices);
    console.log('[FIX] Final choices for ending:', updatedChoices);
    setEndingText(finalText);
    setPhase('ending');
    setCurrentPose('/images/characters/tessa/ending.png');
  } else {
    setCurrentChoiceScene(nextScene);
    setCurrentPose(nextScene.pose);
  }
};

  useEffect(() => {
    let isMounted = true;
    
    const runSequence = async () => {
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
      
      setCurrentPose(introSequence[currentStep].pose);
      await animateText(introSequence[currentStep].tessaText, setTessaText);
      
      await waitForContinue();
      
      if (isMounted) {
        if (currentStep < introSequence.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setPhase('choices');
          setCurrentPose(choiceScenes.firstChoice.pose);
        }
      }
    };

    runSequence();
    return () => { isMounted = false; };
  }, [currentStep]);

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Image Container */}
      <div 
        className="relative"
        style={{
          height: `clamp(${MIN_IMAGE_HEIGHT}px, 65vh, calc(100vh - ${MIN_TEXT_HEIGHT}px))`,
          minHeight: MIN_IMAGE_HEIGHT
        }}
      >
        <div 
          className="relative h-full mx-auto bg-black/20"
          style={{
            aspectRatio: '3/4',
            maxWidth: 'min(90vw, 1200px)'
          }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 h-full w-full">
            <Image
              src="/images/backgrounds/house-front.png"
              alt="Background"
              layout="fill"
              objectFit="contain"
              className="object-left-bottom"
              priority
            />
          </div>
          
          {/* Character Image */}
          <div 
            className="absolute bottom-0 left-1/2 origin-bottom"
            style={{
              width: `${CHARACTER_SIZE_PERCENTAGE}%`,
              height: '85%',
              transform: `translateX(-50%)`
            }}
          >
            <Image
              src={currentPose}
              alt="Tessa"
              layout="fill"
              objectFit="contain"
              className="object-bottom"
            />
          </div>
        </div>
      </div>

      {/* Text Container */}
      <div 
        className="bg-black/80 p-4 overflow-y-auto"
        style={{
          height: `calc(100vh - clamp(${MIN_IMAGE_HEIGHT}px, 65vh, calc(100vh - ${MIN_TEXT_HEIGHT}px)))`,
          minHeight: MIN_TEXT_HEIGHT
        }}
      >
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