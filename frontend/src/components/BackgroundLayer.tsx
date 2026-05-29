import React from 'react';

interface BackgroundLayerProps {
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  backgroundImageUrl,
  backgroundVideoUrl
}) => {
  const hasVideo = !!backgroundVideoUrl && (
    backgroundVideoUrl.endsWith('.mp4') || 
    backgroundVideoUrl.endsWith('.webm') ||
    backgroundVideoUrl.includes('stream')
  );

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 bg-tv-bg">
      {/* 1. Base flowing gradient layer */}
      <div className="absolute inset-0 gradient-bg animate-gradient-flow opacity-80" />

      {/* 2. Background Video support */}
      {hasVideo && (
        <video
          key={backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen scale-105 transition-opacity duration-1000"
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
          <source src={backgroundVideoUrl} type="video/webm" />
        </video>
      )}

      {/* 3. Background Image support (if no video) */}
      {!hasVideo && backgroundImageUrl && (
        <div 
          key={backgroundImageUrl}
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-25 scale-105 transition-all duration-1000 ease-out mix-blend-lighten"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      {/* 4. Glass overlay & light glow leaks (Netflix/Apple TV inspired gradient leaks) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-blue-900/15 rounded-full filter blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[55vh] bg-purple-900/10 rounded-full filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      {/* 5. TV Grid Scanlines Pattern overlay for cinematic texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* 6. Vignette overlay for focus constraint */}
      <div className="absolute inset-0 bg-gradient-to-t from-tv-bg/95 via-transparent to-tv-bg/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-tv-bg/40 via-transparent to-tv-bg/40 pointer-events-none" />
    </div>
  );
};
