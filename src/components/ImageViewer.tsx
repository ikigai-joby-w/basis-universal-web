import * as PIXI from 'pixi.js';
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_RENDERER_OPTIONS } from '../constants';
import { WebGLMemoryInfo } from './WebGLMemoryInfo';

interface ImageViewerProps {
  url: string;
  width: number;
  height: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ url, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<PIXI.Sprite | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);

  // Initialize PIXI Application once
  useEffect(() => {
    if (!containerRef.current) return;

    const initPixi = async () => {
      try {
        // Create a unique canvas for Image viewer to get separate WebGL context
        const imageCanvas = document.createElement('canvas');
        imageCanvas.width = width;
        imageCanvas.height = height;

        // Check WebGL support on the unique canvas
        const gl = imageCanvas.getContext('webgl2');
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
            view: imageCanvas as HTMLCanvasElement,
          });

          // Replace the original canvas with our unique one
          if (containerRef.current) {
            // Clear the container and add our unique canvas
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(imageCanvas);
          }

          (window as any).__PIXI_APP_IMAGE__ = app;

          // Create a container for the sprite
          const container = new PIXI.Container();
          app.stage.addChild(container);

          appRef.current = app;
          setIsInitialized(true);
          setGl(gl);
        }
      } catch (error) {
        console.error('Failed to initialize Image PIXI:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = 'Failed to initialize Image WebGL viewer';
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
      setGl(null);
    };
  }, []);

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

  // Handle URL changes and texture loading
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
        const texture = await PIXI.Assets.load({
          src: url,
          format: 'png',
          loadParser: 'loadTextures',
        });
        console.log('original', texture, url);

        // Create a new sprite with the texture
        const sprite = new PIXI.Sprite(texture);
        sprite.width = width;
        sprite.height = height;

        // Add sprite to the stage
        appRef.current?.stage.addChild(sprite);
        spriteRef.current = sprite;
      } catch (error) {
        console.error('Failed to load texture:', error);
      }
    };

    loadTexture();
  }, [url, width, height, isInitialized]);

  return (
    <>
      <div className="preview image-viewer">
        <div
          ref={containerRef}
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
      </div>
      {/* WebGL Memory Information */}
      <WebGLMemoryInfo gl={gl} title="Image WebGL Memory Info" />
    </>
  );
};
