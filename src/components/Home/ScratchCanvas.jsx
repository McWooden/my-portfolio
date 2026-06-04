import React, { useRef, useState, useEffect } from 'react';

export default function ScratchCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef(null);
  const animRef = useRef(null);
  const scratchedStateRef = useRef(null);
  const imageRef = useRef(null); // original image loaded reference

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load the top image
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    scratchedStateRef.current = null;

    const img = new Image();
    img.src = '/assets/hero.jpeg';
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
      if (isLoaded) {
        initCanvas();
      }
    };
  }, [dimensions]);

  // Handle resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const getCoverSize = (imgWidth, imgHeight, containerWidth, containerHeight) => {
    const imgRatio = imgWidth / imgHeight;
    const containerRatio = containerWidth / containerHeight;
    
    let drawWidth, drawHeight, x, y;
    
    if (imgRatio > containerRatio) {
      // Image is wider than container, height matches container
      drawHeight = containerHeight;
      drawWidth = containerHeight * imgRatio;
      x = (containerWidth - drawWidth) / 2;
      y = 0;
    } else {
      // Image is taller than container, width matches container
      drawWidth = containerWidth;
      drawHeight = containerWidth / imgRatio;
      x = 0;
      y = (containerHeight - drawHeight) / 2;
    }
    
    return { x, y, width: drawWidth, height: drawHeight };
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(dpr, dpr);
    
    const { x, y, width, height } = getCoverSize(
      imageRef.current.naturalWidth,
      imageRef.current.naturalHeight,
      dimensions.width,
      dimensions.height
    );
    
    // Draw initial state using calculated object-cover dimensions
    ctx.drawImage(imageRef.current, x, y, width, height);
    ctx.restore();
  };

  // Run initCanvas once isLoaded changes to true
  useEffect(() => {
    if (isLoaded) {
      initCanvas();
    }
  }, [isLoaded]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const drawErase = (coords) => {
    const canvas = canvasRef.current;
    if (!canvas || !coords) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(coords.x, coords.y);
    
    // Generate a random angle in radians
    const angle = Math.random() * Math.PI * 2;
    ctx.rotate(angle);
    
    ctx.globalCompositeOperation = 'destination-out';
    const size = 70; // square brush size
    ctx.fillRect(-size / 2, -size / 2, size, size);
    
    ctx.restore();
  };

  const animateReset = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Create offscreen canvas to capture current scratched state
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offscreenCtx = offscreen.getContext('2d');
    offscreenCtx.drawImage(canvas, 0, 0);

    scratchedStateRef.current = offscreen;

    const startTime = performance.now();
    const duration = 1000; // 1 second fade duration

    const { x, y, width, height } = getCoverSize(
      imageRef.current.naturalWidth,
      imageRef.current.naturalHeight,
      dimensions.width,
      dimensions.height
    );

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Draw original scratched state with fading alpha
      ctx.globalAlpha = 1 - progress;
      ctx.drawImage(offscreen, 0, 0, dimensions.width, dimensions.height);

      // Draw top image with rising alpha
      ctx.globalAlpha = progress;
      ctx.drawImage(imageRef.current, x, y, width, height);

      ctx.restore();

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
        scratchedStateRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const handleStart = (e) => {
    // Only draw with left click or touch
    if (e.button !== undefined && e.button !== 0) return;
    
    // Prevent default browser dragging of page/images
    e.preventDefault();

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
      
      // Instantly restore to the saved scratched state
      if (scratchedStateRef.current) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(scratchedStateRef.current, 0, 0);
        }
      }
    }
    scratchedStateRef.current = null;

    setIsDrawing(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const coords = getCoordinates(e);
    if (coords) drawErase(coords);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (coords) drawErase(coords);
  };

  const handleEnd = () => {
    setIsDrawing(false);

    // Set 10s auto-reset timeout after scratching stops
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      animateReset();
    }, 10000);
  };

  // Attach global window listeners during drawing so mouse/touch holds through overlays and canvas boundaries
  useEffect(() => {
    if (isDrawing) {
      const onMove = (e) => {
        if (e.cancelable) e.preventDefault();
        handleMove(e);
      };
      const onEnd = () => handleEnd();

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);

      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      };
    }
  }, [isDrawing]);

  // Cleanup timeout and animation on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden rounded-[22px] select-none"
      style={{ touchAction: 'none' }}
    >
      {isLoaded && (
        <>
          {/* Bottom Layer: hero-two.jpeg */}
          <img
            src="/assets/hero-two.jpeg"
            alt="Erase reveal view"
            className="w-full h-full object-cover pointer-events-none select-none absolute inset-0"
          />

          {/* Middle Layer: Scratch Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            style={{ touchAction: 'none' }}
          />
        </>
      )}
    </div>
  );
}
