import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const loadingMessages = [
  "Scanning global inventory...",
  "Finding exclusive deals...",
  "Accessing LVC member rates..."
];
 
// Change prop name back to isLoading
interface LoadingOverlayProps {
  isLoading: boolean;
}

// Change prop name back to isLoading
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined; // Initialize as undefined

    // Use isLoading prop
    if (isLoading) {
      setMessageIndex(0); 
      intervalId = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 1500); 
    } else {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  // Update dependency array to use isLoading
  }, [isLoading]); 

  // Check isLoading prop
  if (!isLoading) {
    return null; 
  }

  return (
    // ... rest of the JSX with the compass logo and messages ...
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
       {/* LVC Compass Logo with Heartbeat Animation */}
       <div className="h-36 w-36 mb-6 relative animate-heartbeat">
         <Image
           src="/LifeStyleVacationClubs-Logo_compass_only.png"
           alt="Lifestyle Vacation Clubs Compass"
           fill
           className="object-contain drop-shadow-glow"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           priority
         />
       </div>
       
       {/* Loading Message */}
       <p className="text-2xl font-bold text-white animate-pulse">
         {loadingMessages[messageIndex]}
       </p>
 
       {/* Custom CSS for heartbeat animation */}
       <style jsx global>{`
         @keyframes heartbeat {
           0% {
             transform: scale(1);
           }
           50% {
             transform: scale(1.1); /* Scale up slightly */
           }
           100% {
             transform: scale(1);
           }
         }

         .animate-heartbeat {
           animation: heartbeat 1.5s ease-in-out infinite;
         }
       `}</style>
     </div>
  );
}; 