import type { LoaderParser } from 'pixi.js';
import * as PIXI from 'pixi.js';
import 'pixi.js/basis';
import React, { useEffect, useRef, useState } from 'react';
import 'webgl-memory';
import { DEFAULT_RENDERER_OPTIONS } from '../constants';
import { WebGLMemoryInfo } from './WebGLMemoryInfo';

interface BasisViewerProps {
  url: string;
  width: number;
  height: number;
}

export const BasisViewer: React.FC<BasisViewerProps> = ({ url, width, height }) => {
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
        // Create a unique canvas for Basis viewer to get separate WebGL context
        const basisCanvas = document.createElement('canvas');
        basisCanvas.width = width;
        basisCanvas.height = height;

        // Check WebGL support on the unique canvas
        const gl = basisCanvas.getContext('webgl2');
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
            view: basisCanvas as HTMLCanvasElement,
          });

          try {
            // Configure BASIS transcoder
            await PIXI.setBasisTranscoderPath({
              jsUrl: '/basis/basis_transcoder.js',
              wasmUrl: '/basis/basis_transcoder.wasm',
            });

            // Check if BASIS loader is already registered
            const hasBasisLoader = PIXI.Assets.loader.parsers.some(
              parser => 'name' in parser && parser.name === 'loadBasis'
            );

            console.log('Basis loader already registered:', hasBasisLoader);
            console.log(
              'Available parsers:',
              PIXI.Assets.loader.parsers.map(p => ('name' in p ? p.name : 'unnamed'))
            );

            // Only register the BASIS loader if it's not already registered
            if (!hasBasisLoader) {
              (PIXI.Assets.loader.parsers as LoaderParser[]).push(PIXI.loadBasis as LoaderParser);
              console.log('Basis loader registered');
            }

            // Replace the original canvas with our unique one
            if (containerRef.current) {
              // Clear the container and add our unique canvas
              containerRef.current.innerHTML = '';
              containerRef.current.appendChild(basisCanvas);
            }

            (window as any).__PIXI_APP_BASIS__ = app;

            // Create a container for the sprite
            const container = new PIXI.Container();
            app.stage.addChild(container);

            appRef.current = app;
            setIsInitialized(true);
            setGl(gl);
          } catch (error) {
            console.error('Failed to initialize BASIS transcoder:', error);
            if (containerRef.current) {
              containerRef.current.innerHTML = 'Failed to initialize BASIS transcoder';
            }
            return;
          }
        }
      } catch (error) {
        console.error('Failed to initialize Basis PIXI:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = 'Failed to initialize Basis WebGL viewer';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        console.log('Loading BASIS texture from URL:', url);
        console.log(
          'Available parsers before load:',
          PIXI.Assets.loader.parsers.map(p => ('name' in p ? p.name : 'unnamed'))
        );

        // Check if the file exists first
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          console.log('File loaded successfully, size:', arrayBuffer.byteLength, 'bytes');

          // Check the first few bytes to see if it's a valid Basis file
          const uint8Array = new Uint8Array(arrayBuffer);
          const header = Array.from(uint8Array.slice(0, 16))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
          console.log('File header (first 16 bytes):', header);

          // Check if it starts with the Basis magic number
          const magic = new Uint32Array(arrayBuffer.slice(0, 4));
          console.log('Magic number:', magic[0].toString(16));
        } catch (fetchError) {
          console.error('Failed to fetch file:', fetchError);
        }

        // Load and display the BASIS texture
        console.log('Starting PIXI.Assets.load...');
        const texture = await PIXI.Assets.load(url);

        console.log('Successfully loaded BASIS texture:', texture);
        console.log('Texture dimensions:', texture.width, 'x', texture.height);

        // Create a new sprite with the texture
        const sprite = new PIXI.Sprite(texture);
        sprite.width = width;
        sprite.height = height;

        // Add sprite to the stage
        appRef.current?.stage.addChild(sprite);
        spriteRef.current = sprite;
      } catch (error) {
        console.error('Failed to load BASIS texture:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          url,
          isInitialized,
          hasApp: !!appRef.current,
        });
        if (containerRef.current) {
          containerRef.current.innerHTML = `Failed to load BASIS texture: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    };

    loadTexture();
  }, [url, width, height, isInitialized]);

  return (
    <>
      <div className="preview basis-viewer">
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
      <WebGLMemoryInfo gl={gl} title="Basis WebGL Memory Info" />
    </>
  );
};
