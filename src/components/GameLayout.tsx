// GameLayout.tsx
"use client";
import Image from 'next/image';

interface GameLayoutProps {
  currentPose: string;
  children: React.ReactNode;
}

const GameLayout = ({ currentPose, children }: GameLayoutProps) => {
  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Same image container structure from GameScene */}
      <div className="relative" style={{ /*...*/ }}>
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
        <div className="absolute bottom-0 left-1/2 origin-bottom" style={{ /*...*/ }}>
          <Image
            src={currentPose}
            alt="Tessa"
            layout="fill"
            objectFit="contain"
            className="object-bottom"
          />
        </div>
      </div>

      {/* Text Container */}
      <div className="bg-black/80 p-4 overflow-y-auto" style={{ /*...*/ }}>
        <div className="max-w-2xl mx-auto space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
};