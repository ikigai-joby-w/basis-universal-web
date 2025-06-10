import * as PIXI from 'pixi.js';
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_RENDERER_OPTIONS } from '../constants';

interface KTX2ViewerProps {
  url: string;
  width: number;
  height: number;
}

export const KTX2Viewer: React.FC<KTX2ViewerProps> = ({ url, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<PIXI.Sprite | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize PIXI Application once
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const initPixi = async () => {
      try {
        // Check WebGL support
        const gl = canvasRef.current?.getContext('webgl2');
        if (!gl) {
          throw new Error('WebGL is not supported in your browser');
        }

        // Create PIXI Application if it doesn't exist
        if (!appRef.current) {
          const app = new PIXI.Application();
          await app.init({
            width,
            height,
            ...DEFAULT_RENDERER_OPTIONS,
            view: canvasRef.current as HTMLCanvasElement,
          });

          // Create a container for the sprite
          const container = new PIXI.Container();
          app.stage.addChild(container);

          appRef.current = app;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize PIXI:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = 'Failed to initialize WebGL viewer';
        }
      }
    };

    initPixi();

    // Cleanup function
    return () => {
      if (spriteRef.current) {
        spriteRef.current.destroy({ children: true });
        spriteRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      setIsInitialized(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Handle size changes
  useEffect(() => {
    if (!isInitialized || !appRef.current) return;

    try {
      appRef.current.renderer.resize(width, height);

      if (spriteRef.current) {
        spriteRef.current.width = width;
        spriteRef.current.height = height;
      }
    } catch (error) {
      console.error('Error resizing renderer:', error);
    }
  }, [width, height, isInitialized]);

  // Handle URL changes
  useEffect(() => {
    if (!isInitialized || !appRef.current) return;

    const loadTexture = async () => {
      try {
        // Destroy old sprite if it exists
        if (spriteRef.current) {
          spriteRef.current.destroy({ children: true });
          spriteRef.current = null;
        }

        // Load and display the KTX2 texture
        const texture = await PIXI.Assets.load(url);

        // Create a new sprite with the texture
        const sprite = new PIXI.Sprite(texture);
        sprite.width = width;
        sprite.height = height;

        // Add sprite to the stage
        appRef.current?.stage.addChild(sprite);
        spriteRef.current = sprite;
      } catch (error) {
        console.error('Failed to load KTX2 texture:', error);
      }
    };

    loadTexture();
  }, [url, width, height, isInitialized]); // Include width and height to ensure sprite size is correct

  return (
    <div
      ref={containerRef}
      className="ktx2-viewer"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
