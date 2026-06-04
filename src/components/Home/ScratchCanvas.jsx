import React, { useRef, useState, useEffect } from 'react';

export default function ScratchCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResetting, setIsResetting] = useState(true);
  const timeoutRef = useRef(null);
  const imageRef = useRef(null); // original image loaded reference

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load the top image
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/hero.jpeg';
    img.onload = () => {
      imageRef.current = img;
      initCanvas();
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

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { x, y, width, height } = getCoverSize(
      imageRef.current.naturalWidth,
      imageRef.current.naturalHeight,
      dimensions.width,
      dimensions.height
    );
    
    // Draw initial state using calculated object-cover dimensions
    ctx.drawImage(imageRef.current, x, y, width, height);
  };

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
    ctx.save();
    ctx.translate(coords.x, coords.y);
    
    // Generate a random angle in radians
    const angle = Math.random() * Math.PI * 2;
    ctx.rotate(angle);
    
    ctx.globalCompositeOperation = 'destination-out';
    const size = 70; // square brush size
    ctx.fillRect(-size / 2, -size / 2, size, size);
    
    ctx.restore();
  };

  const handleStart = (e) => {
    // Only draw with left click or touch
    if (e.button !== undefined && e.button !== 0) return;
    
    // Prevent default browser dragging of page/images
    e.preventDefault();

    setIsDrawing(true);
    setIsResetting(false);

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
      setIsResetting(true);
      // Wait for the 1s CSS transition to complete, then redraw canvas fully
      setTimeout(() => {
        initCanvas();
      }, 1000);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden rounded-[30px] select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Bottom Layer: hero-two.jpeg */}
      <img
        src="/assets/hero-two.jpeg"
        alt="Erase reveal view"
        className="w-full h-full object-cover rounded-[30px] pointer-events-none select-none absolute inset-0"
      />

      {/* Middle Layer: Scratch Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        style={{ touchAction: 'none' }}
      />

      {/* Top Layer: Smooth Fade-Back Overlay */}
      <img
        src="/assets/hero.jpeg"
        alt="Top erase view overlay"
        className="w-full h-full object-cover rounded-[30px] pointer-events-none select-none absolute inset-0 z-20"
        style={{
          opacity: isResetting ? 1 : 0,
          transition: isResetting ? 'opacity 1000ms ease-in-out' : 'none'
        }}
      />
    </div>
  );
}
