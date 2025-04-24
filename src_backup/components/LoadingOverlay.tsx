'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const loadingMessages = [
  "Scanning global inventory...",
  "Finding exclusive deals...",
  "Accessing LVC member rates..."
];

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isVisible) {
      // Start cycling messages when overlay becomes visible
      setMessageIndex(0); // Reset to first message
      intervalId = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 1500); // Change message every 1.5 seconds
    } else {
      // Clear interval if overlay is hidden
      if (intervalId) {
        clearInterval(intervalId);
      }
    }

    // Cleanup function to clear interval when component unmounts or visibility changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible]); // Rerun effect when visibility changes

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* LVC Compass Logo Animation */}
      <div className="h-36 w-36 mb-6 relative perspective-container">
        <div className="rotate-animation">
          <Image
            src="/LifeStyleVacationClubs-Logo_compass_only.png"
            alt="Lifestyle Vacation Clubs Compass"
            fill
            className="object-contain drop-shadow-glow"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      </div>
      
      {/* Loading Message */}
      <p className="text-white text-xl font-semibold text-center px-4">
        {loadingMessages[messageIndex]}
      </p>

      {/* Custom CSS for rotation animation */}
      <style jsx global>{`
        .perspective-container {
          perspective: 1000px;
        }
        
        @keyframes rotate {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-360deg);
          }
        }
        
        .rotate-animation {
          animation: rotate 3s infinite linear;
          transform-style: preserve-3d;
          position: relative;
          width: 100%;
          height: 100%;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
        }
      `}</style>
    </div>
  );
}; 