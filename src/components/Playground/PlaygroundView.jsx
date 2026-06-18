import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Section from '../Utils/Section';
import SectionHeader from '../Utils/SectionHeader';

export default function PlaygroundView() {
  const canvasRef = useRef(null);
  
  // Game states
  const [isDashing, setIsDashing] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 250, y: 250 });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Key tracking
  const keysPressed = useRef({});

  // Entity config
  const R = 25; // Upper semi-circle radius
  const H = 25; // Lower flat body height
  
  // Entity physics ref
  const entity = useRef({
    x: 250,
    y: 250,
    vx: 0,
    vy: 0,
    baseSpeed: 4,
    dashSpeed: 12,
    dashActive: false,
    dashDuration: 8, // frames
    dashTimer: 0,
    dashCooldown: 0,
    trail: [] // Array of {x, y, alpha}
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Canvas size
    canvas.width = 500;
    canvas.height = 500;

    // Listeners
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keysPressed.current[e.key] = true;
      keysPressed.current[key] = true;
      
      // Prevent scrolling when pressing game controls
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keysPressed.current[e.key] = false;
      keysPressed.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Render loop
    const update = () => {
      const ent = entity.current;

      // 1. Dash Timer
      if (ent.dashActive) {
        ent.dashTimer--;
        if (ent.dashTimer <= 0) {
          ent.dashActive = false;
          setIsDashing(false);
        }
      }

      // Check for Dash activation (spammable — resets timer on every press)
      const wantDash = keysPressed.current[' '] || keysPressed.current['shift'];
      if (wantDash) {
        ent.dashActive = true;
        ent.dashTimer = ent.dashDuration;
        setIsDashing(true);
      }

      // 2. Movement direction calculation
      let dx = 0;
      let dy = 0;
      if (keysPressed.current['arrowup'] || keysPressed.current['w']) dy -= 1;
      if (keysPressed.current['arrowdown'] || keysPressed.current['s']) dy += 1;
      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) dx -= 1;
      if (keysPressed.current['arrowright'] || keysPressed.current['d']) dx += 1;

      // Diagonal speed normalization
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      // 3. Update velocity & position
      const currentSpeed = ent.dashActive ? ent.dashSpeed : ent.baseSpeed;
      setSpeedMultiplier(ent.dashActive ? 3.0 : 1.0);
      ent.vx = dx * currentSpeed;
      ent.vy = dy * currentSpeed;

      ent.x += ent.vx;
      ent.y += ent.vy;

      // 4. Bound checking (1x1 area limit)
      // Left edge: x - R, Right edge: x + R
      // Top edge: y - R, Bottom edge: y + H
      if (ent.x - R < 0) ent.x = R;
      if (ent.x + R > canvas.width) ent.x = canvas.width - R;
      if (ent.y - R < 0) ent.y = R;
      if (ent.y + H > canvas.height) ent.y = canvas.height - H;

      setCoordinates({ x: Math.round(ent.x), y: Math.round(ent.y) });

      // 5. Manage dash trail
      if (ent.dashActive) {
        ent.trail.push({ x: ent.x, y: ent.y, alpha: 0.6 });
      }
      ent.trail.forEach(t => t.alpha -= 0.04);
      ent.trail = ent.trail.filter(t => t.alpha > 0);

      // 6. Drawing Code
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background (for developer aesthetic)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw Boundary Highlights
      ctx.strokeStyle = 'rgba(224, 255, 111, 0.15)';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Helper function to draw the half-pill entity
      const drawHalfPill = (x, y, alpha, isTrail = false) => {
        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw outer body gradient
        const grad = ctx.createLinearGradient(x - R, y - R, x + R, y + H);
        if (isTrail) {
          grad.addColorStop(0, 'rgba(224, 255, 111, 0.3)');
          grad.addColorStop(1, 'rgba(224, 255, 111, 0.05)');
        } else {
          grad.addColorStop(0, '#E0FF6F'); // Neon Accent
          grad.addColorStop(1, '#BADA55');
        }

        ctx.beginPath();
        // Upper dome (semi-circle)
        ctx.arc(x, y, R, Math.PI, 0, false);
        // Right vertical body
        ctx.lineTo(x + R, y + H);
        // Flat bottom line
        ctx.lineTo(x - R, y + H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // If it's a trail, skip drawing details like eyes
        if (!isTrail) {
          // Draw subtle outline
          ctx.strokeStyle = 'rgba(15, 15, 17, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Double eyes setup (only black pills)
          const eyeSpacing = 11;
          const eyeYOffset = H / 4;
          
          // Calculate gaze offset based on velocity
          let gazeX = 0;
          let gazeY = 0;
          if (ent.vx !== 0 || ent.vy !== 0) {
            const angle = Math.atan2(ent.vy, ent.vx);
            gazeX = Math.cos(angle) * 3;
            gazeY = Math.sin(angle) * 2;
          }

          const drawEye = (eyeX, eyeY) => {
            // Draw only black pill-shaped pupil (capsule) with increased size
            ctx.save();
            ctx.beginPath();
            const pupilX = eyeX + gazeX;
            const pupilY = eyeY + gazeY;
            const pw = 6;  // pupil width (increased)
            const ph = 12; // pupil height (increased)

            ctx.fillStyle = '#0F0F11';
            if (ctx.roundRect) {
              ctx.roundRect(pupilX - pw / 2, pupilY - ph / 2, pw, ph, pw / 2);
            } else {
              // Fallback if roundRect is not supported
              ctx.arc(pupilX, pupilY, pw / 2, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
          };

          // Left eye and Right eye
          drawEye(x - eyeSpacing, y + eyeYOffset);
          drawEye(x + eyeSpacing, y + eyeYOffset);
        }

        ctx.restore();
      };

      // Draw trails
      ent.trail.forEach(t => drawHalfPill(t.x, t.y, t.alpha, true));

      // Draw main player
      drawHalfPill(ent.x, ent.y, 1.0, false);

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Section id="playground">
      
      <SectionHeader
        index="✦"
        tag="Interactive"
        name="Game"
        title="Entity Playground"
        subtitle="Control the 2D half-pill entity inside the bounds. Use your keyboard to guide it, test out the speed dash, and watch the dynamic pill eyes follow your directions."
      />

      {/* Main Game Card */}
      <div className="relative p-6 md:p-8 bg-[#161619]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-8 items-center max-w-4xl w-full">
        
        {/* Aspect Ratio 1:1 Canvas */}
        <div className="relative bg-[#0F0F11] border border-white/5 rounded-xl overflow-hidden aspect-square max-w-[420px] w-full flex-shrink-0 shadow-inner">
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          {/* Dash Overlay Indicator */}
          {isDashing && (
            <div className="absolute top-4 right-4 bg-[#E0FF6F] text-[#0F0F11] text-xs font-bold font-mono px-2 py-1 rounded shadow-lg animate-pulse uppercase">
              Dashing
            </div>
          )}
        </div>

        {/* Dashboard / Controls Panel */}
        <div className="flex-grow flex flex-col justify-between h-full w-full py-2">
          <div>
            <h3 className="text-lg font-bold font-mono text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">
              Diagnostics
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-mono bg-[#0F0F11]/40 p-3 rounded-lg border border-white/5">
                <span className="text-[#99999C]">Coordinates:</span>
                <span className="text-[#E0FF6F] font-bold">X: {coordinates.x} | Y: {coordinates.y}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-mono bg-[#0F0F11]/40 p-3 rounded-lg border border-white/5">
                <span className="text-[#99999C]">Velocity multiplier:</span>
                <span className="text-white font-bold">{speedMultiplier.toFixed(1)}x</span>
              </div>

              <div className="flex justify-between items-center text-sm font-mono bg-[#0F0F11]/40 p-3 rounded-lg border border-white/5">
                <span className="text-[#99999C]">Bounds checking:</span>
                <span className="text-emerald-400 font-bold">Active (1x1 Area)</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold font-mono text-white mb-3 uppercase tracking-wider">
              Control Bindings
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-[#99999C] font-mono mb-6">
              <li className="flex items-center gap-3">
                <kbd className="bg-[#242429] px-2 py-1 rounded border border-white/10 text-white font-semibold shadow-sm text-xs">W, A, S, D</kbd>
                <span>or</span>
                <kbd className="bg-[#242429] px-2 py-1 rounded border border-white/10 text-white font-semibold shadow-sm text-xs">↑, ←, ↓, →</kbd>
                <span>to move around</span>
              </li>
              <li className="flex items-center gap-3">
                <kbd className="bg-[#242429] px-4 py-1 rounded border border-white/10 text-white font-semibold shadow-sm text-xs">Space</kbd>
                <span>or</span>
                <kbd className="bg-[#242429] px-3 py-1 rounded border border-white/10 text-white font-semibold shadow-sm text-xs">Shift</kbd>
                <span>to Dash & Speed up</span>
              </li>
            </ul>

            <Link href="/" className="inline-flex items-center justify-center w-full px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-200 text-sm font-semibold font-mono text-[#EFEFEE]">
              &larr; Back to Portfolio
            </Link>
          </div>
        </div>

      </div>

    </Section>
  );
}

