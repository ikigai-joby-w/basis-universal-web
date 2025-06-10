import React from 'react';
import { MipmapGenerationProps } from '../types';

export const MipmapGeneration: React.FC<MipmapGenerationProps> = ({ checked, onChange }) => {
  return (
    <div className="form-group">
      <label>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />{' '}
        Generate Mipmaps
      </label>
      <div className="description">
        Automatically generate multiple levels of textures for 3D scene distance rendering.
      </div>
    </div>
  );
};
