"use client";
import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './SideRays.css';

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const originToFlip = origin => {
  switch (origin) {
    case 'top-left': return [1, 0];
    case 'bottom-right': return [0, 1];
    case 'bottom-left': return [1, 1];
    default: return [0, 0];
  }
};

const SideRays = ({
  speed = 2.5,
  rayColor1 = '#EAB308',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = ''
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef(null);
  const meshRef = useRef(null);
  const animationIdRef = useRef(null);
  const isVisibleRef = useRef(true);
  const [isVisible, setIsVisible] = useState(true);

  // Update visibility ref for the WebGL loop to access without re-binding
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Setup Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // WebGL Lifecycle (Runs ONCE on mount)
  useEffect(() => {
    if (!containerRef.current) return;

    let renderer;
    let gl;
    let uniforms;
    let geometry;
    let program;
    let mesh;

    const init = async () => {
      if (!containerRef.current) return;

      // Small delay to ensure container dimension calculation is ready
      await new Promise(resolve => setTimeout(resolve, 50));
      if (!containerRef.current) return;

      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 1.2) * 0.5, // Render at reduced resolution for massive GPU performance savings
        alpha: true
      });
      rendererRef.current = renderer;

      gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      // Clear any placeholder canvases
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`;

      const [flipX, flipY] = originToFlip(origin);
      uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) },
        iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity },
        iSpread: { value: spread },
        iFlipX: { value: flipX },
        iFlipY: { value: flipY },
        iTilt: { value: tilt },
        iSaturation: { value: saturation },
        iBlend: { value: blend },
        iFalloff: { value: falloff },
        iOpacity: { value: opacity }
      };
      uniformsRef.current = uniforms;

      geometry = new Triangle(gl);
      program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
      mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updateSize = () => {
        if (!containerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 1.2) * 0.5;
        const { clientWidth: w, clientHeight: h } = containerRef.current;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
      };

      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateSize, 150);
      };

      window.addEventListener('resize', handleResize);
      updateSize();

      // The loop function
      const loop = t => {
        // Stop the animation loop entirely if it is not visible
        if (!isVisibleRef.current) {
          animationIdRef.current = null;
          return;
        }

        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniforms.iTime.value = t * 0.001;
        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (e) {
          return;
        }
      };

      animationIdRef.current = requestAnimationFrame(loop);

      // Save custom resize listener for cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    };

    let sizeCleanup;
    init().then(cleanup => {
      sizeCleanup = cleanup;
    });

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (sizeCleanup) sizeCleanup();
      if (renderer) {
        try {
          const loseCtx = renderer.gl.getExtension('WEBGL_lose_context');
          if (loseCtx) loseCtx.loseContext();
          const canvas = renderer.gl.canvas;
          if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        } catch (e) {}
      }
      rendererRef.current = null;
      uniformsRef.current = null;
      meshRef.current = null;
    };
  }, []); // Run only once on mount

  // Handle uniforms updates dynamically without re-creating WebGL Context
  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;
    u.iSpeed.value = speed;
    u.iRayColor1.value = hexToRgb(rayColor1);
    u.iRayColor2.value = hexToRgb(rayColor2);
    u.iIntensity.value = intensity;
    u.iSpread.value = spread;
    const [flipX, flipY] = originToFlip(origin);
    u.iFlipX.value = flipX;
    u.iFlipY.value = flipY;
    u.iTilt.value = tilt;
    u.iSaturation.value = saturation;
    u.iBlend.value = blend;
    u.iFalloff.value = falloff;
    u.iOpacity.value = opacity;
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  // Restart loop when visibility changes back to true
  useEffect(() => {
    if (isVisible && !animationIdRef.current && rendererRef.current && uniformsRef.current && meshRef.current) {
      const loop = t => {
        if (!isVisibleRef.current) {
          animationIdRef.current = null;
          return;
        }
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniformsRef.current.iTime.value = t * 0.001;
        try {
          rendererRef.current.render({ scene: meshRef.current });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (e) {
          return;
        }
      };
      animationIdRef.current = requestAnimationFrame(loop);
    }
  }, [isVisible]);

  return <div ref={containerRef} className={`side-rays-container ${className}`.trim()} />;
};

export default SideRays;
