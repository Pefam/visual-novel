"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { introSequence } from '../data/introScene';

// Configuration Constants
const MIN_CONTAINER_WIDTH = 320;
const MIN_IMAGE_HEIGHT = 300; // Minimum height for image container
const MIN_TEXT_HEIGHT = 200;  // Minimum height for text container
const CHARACTER_SIZE_PERCENTAGE = 60;
const CHARACTER_OFFSET = { x: 0, y: 0 };

const GameScene = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [playerText, setPlayerText] = useState('');
  const [tessaText, setTessaText] = useState('');
  const [currentPose, setCurrentPose] = useState(introSequence[0].pose);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentScene = introSequence[currentStep];

  // Image preloading
  useEffect(() => {
    introSequence.forEach(scene => {
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

  useEffect(() => {
    let isMounted = true;
    
    const runSequence = async () => {
      if (currentStep > 0) {
        setPlayerText('');
        setTessaText('');
      }
      
      await animateText(currentScene.playerText, setPlayerText);
      
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
      
      setCurrentPose(currentScene.pose);
      await animateText(currentScene.tessaText, setTessaText);
      
      await waitForContinue();
      
      if (isMounted && currentStep < introSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
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
            minWidth: MIN_CONTAINER_WIDTH,
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
              minWidth: `${(MIN_CONTAINER_WIDTH * CHARACTER_SIZE_PERCENTAGE) / 100}px`,
              height: '85%',
              transform: `translateX(calc(-50% + ${CHARACTER_OFFSET.x}px)) translateY(${CHARACTER_OFFSET.y}px)`
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
        </div>
      </div>
    </div>
  );
};

export default GameScene;