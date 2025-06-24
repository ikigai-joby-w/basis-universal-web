import React, { useEffect, useState } from 'react';
import { formatMemorySize } from '../utils';

interface WebGLMemoryInfoProps {
  gl: WebGL2RenderingContext | null;
  title?: string;
}

interface WebGLMemoryInfo {
  memory: {
    buffer: number;
    drawingbuffer: number;
    renderbuffer: number;
    texture: number;
    total: number;
  };
  resources: {
    buffer: number;
    framebuffer: number;
    program: number;
    query: number;
    renderbuffer: number;
    sampler: number;
    shader: number;
    sync: number;
    texture: number;
    transformFeedback: number;
    vertexArray: number;
  };
}

export const WebGLMemoryInfo: React.FC<WebGLMemoryInfoProps> = ({
  gl,
  title = 'WebGL Memory Info',
}) => {
  const [webglMemory, setWebglMemory] = useState<WebGLMemoryInfo | null>(null);
  const [isMemoryInfoOpen, setIsMemoryInfoOpen] = useState(false);

  // Initialize webgl-memory tracking
  useEffect(() => {
    if (!gl) {
      setWebglMemory(null);
      return;
    }

    const ext = gl.getExtension('GMAN_webgl_memory');
    if (!ext) {
      console.warn(`${title} - WebGL memory extension not available`);
      setWebglMemory(null);
      return;
    }

    const updateMemoryInfo = () => {
      try {
        const info = ext.getMemoryInfo();
        // Check if the info object has valid values
        if (info && typeof info === 'object') {
          setWebglMemory({
            memory: {
              buffer: info.memory.buffer || 0,
              drawingbuffer: info.memory.drawingbuffer || 0,
              renderbuffer: info.memory.renderbuffer || 0,
              texture: info.memory.texture || 0,
              total: info.memory.total || 0,
            },
            resources: {
              buffer: info.resources.buffer || 0,
              framebuffer: info.resources.framebuffer || 0,
              program: info.resources.program || 0,
              query: info.resources.query || 0,
              renderbuffer: info.resources.renderbuffer || 0,
              sampler: info.resources.sampler || 0,
              shader: info.resources.shader || 0,
              sync: info.resources.sync || 0,
              texture: info.resources.texture || 0,
              transformFeedback: info.resources.transformFeedback || 0,
              vertexArray: info.resources.vertexArray || 0,
            },
          });
        } else {
          console.warn(`${title} - WebGL memory extension returned invalid data`);
          setWebglMemory(null);
        }
      } catch (error) {
        console.warn(`Failed to get ${title} WebGL memory info:`, error);
        setWebglMemory(null);
      }
    };

    // Update memory info periodically
    const interval = setInterval(updateMemoryInfo, 1000);
    updateMemoryInfo(); // Initial update

    return () => clearInterval(interval);
  }, [gl, title]);

  return (
    <div className="webgl-memory-info">
      <button
        className="memory-info-toggle"
        onClick={() => setIsMemoryInfoOpen(!isMemoryInfoOpen)}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#2a2a2a',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '16px' }}>{isMemoryInfoOpen ? '▼' : '▶'}</span>
      </button>

      {isMemoryInfoOpen && (
        <div
          className="memory-info-content"
          style={{ padding: '12px', backgroundColor: '#1a1a1a', borderTop: '1px solid #444' }}
        >
          {webglMemory ? (
            <>
              <div className="info-row">
                <span>Total GPU Memory:</span>
                <span>{formatMemorySize(webglMemory.memory.total)}</span>
              </div>
              <div className="info-row">
                <span>Texture Memory:</span>
                <span>{formatMemorySize(webglMemory.memory.texture)}</span>
              </div>
              <div className="info-row">
                <span>Buffer Memory:</span>
                <span>{formatMemorySize(webglMemory.memory.buffer)}</span>
              </div>
              <div className="info-row">
                <span>Drawing Buffer Memory:</span>
                <span>{formatMemorySize(webglMemory.memory.drawingbuffer)}</span>
              </div>
              {/* <div className="info-row">
                <span>Render Buffer Memory:</span>
                <span>{formatMemorySize(webglMemory.memory.renderbuffer)}</span>
              </div>
              <div className="info-row">
                <span>Textures:</span>
                <span>{webglMemory.resources.texture}</span>
              </div>
              <div className="info-row">
                <span>Programs:</span>
                <span>{webglMemory.resources.program}</span>
              </div>
              <div className="info-row">
                <span>Buffers:</span>
                <span>{webglMemory.resources.buffer}</span>
              </div>
              <div className="info-row">
                <span>Framebuffers:</span>
                <span>{webglMemory.resources.framebuffer}</span>
              </div>
              <div className="info-row">
                <span>Renderbuffers:</span>
                <span>{webglMemory.resources.renderbuffer}</span>
              </div>
              <div className="info-row">
                <span>Shaders:</span>
                <span>{webglMemory.resources.shader}</span>
              </div>
              <div className="info-row">
                <span>Samplers:</span>
                <span>{webglMemory.resources.sampler}</span>
              </div>
              <div className="info-row">
                <span>Vertex Arrays:</span>
                <span>{webglMemory.resources.vertexArray}</span>
              </div>
              <div className="info-row">
                <span>Queries:</span>
                <span>{webglMemory.resources.query}</span>
              </div>
              <div className="info-row">
                <span>Sync Objects:</span>
                <span>{webglMemory.resources.sync}</span>
              </div>
              <div className="info-row">
                <span>Transform Feedback:</span>
                <span>{webglMemory.resources.transformFeedback}</span>
              </div> */}
            </>
          ) : (
            <div className="info-row">
              <span>WebGL Memory:</span>
              <span>Not available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
