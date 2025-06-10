import React, { memo, useCallback } from 'react';
import { MODE_DESCRIPTIONS, OPTION_CONSTRAINTS } from '../constants';
import { CompressionMode, CompressionOptionsProps } from '../types';
import { validateCompressionOptions } from '../utils';

const CompressionOptions: React.FC<CompressionOptionsProps> = ({
  mode,
  onModeChange,
  options,
  onOptionsChange,
}) => {
  const handleModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onModeChange(event.target.value as CompressionMode);
    },
    [onModeChange]
  );

  const handleNumberChange = useCallback(
    (name: string, value: string) => {
      const numValue = Number(value);
      const constraints = OPTION_CONSTRAINTS[name as keyof typeof OPTION_CONSTRAINTS];

      if (
        !isNaN(numValue) &&
        validateCompressionOptions(
          numValue,
          constraints.min,
          constraints.max,
          'step' in constraints ? constraints.step : undefined
        )
      ) {
        onOptionsChange(name, numValue);
      }
    },
    [onOptionsChange]
  );

  return (
    <div className="form-group">
      <label htmlFor="compressionMode">Compression Mode:</label>
      <select
        id="compressionMode"
        value={mode}
        onChange={handleModeChange}
        aria-label="Select compression mode"
      >
        <option value="etc1s">ETC1S (Low-Medium Quality, Transparency Support)</option>
        <option value="uastc">UASTC LDR 4x4 (High Quality LDR)</option>
        <option value="uastc_rdo">UASTC LDR RDO (High Quality LDR, Optimized Size)</option>
        <option value="hdr_4x4">UASTC HDR 4x4 (High Quality HDR)</option>
        <option value="hdr_6x6">UASTC HDR 6x6 (High Quality HDR, Smaller Files)</option>
        <option value="hdr_6x6i">UASTC HDR 6x6 Intermediate (GPU Photo)</option>
      </select>
      <div className="description" role="note">
        {MODE_DESCRIPTIONS[mode]}
      </div>

      {mode === 'etc1s' && (
        <div
          id="etc1sOptions"
          className="mode-options active"
          role="group"
          aria-label="ETC1S Options"
        >
          <div className="form-group">
            <label htmlFor="quality">Quality (1-255):</label>
            <input
              type="number"
              id="quality"
              min={OPTION_CONSTRAINTS.quality.min}
              max={OPTION_CONSTRAINTS.quality.max}
              value={options.quality}
              onChange={e => handleNumberChange('quality', e.target.value)}
              required
              aria-describedby="quality-description"
            />
            <div id="quality-description" className="description">
              Higher values produce better quality but larger files. Default is 128.
            </div>
          </div>
        </div>
      )}

      {mode === 'uastc_rdo' && (
        <div
          id="uastcRdoOptions"
          className="mode-options active"
          role="group"
          aria-label="UASTC RDO Options"
        >
          <div className="form-group">
            <label htmlFor="rdoQuality">RDO Quality (0.2-3.0):</label>
            <input
              type="number"
              id="rdoQuality"
              min={OPTION_CONSTRAINTS.rdoQuality.min}
              max={OPTION_CONSTRAINTS.rdoQuality.max}
              step={OPTION_CONSTRAINTS.rdoQuality.step}
              value={options.rdoQuality}
              onChange={e => handleNumberChange('rdoQuality', e.target.value)}
              required
              aria-describedby="rdo-description"
            />
            <div id="rdo-description" className="description">
              Lower values produce better quality but larger files. Default is 1.0.
            </div>
          </div>
        </div>
      )}

      {(mode === 'hdr_6x6' || mode === 'hdr_6x6i') && (
        <div
          id="hdr6x6Options"
          className="mode-options active"
          role="group"
          aria-label="HDR 6x6 Options"
        >
          <div className="form-group">
            <label htmlFor="lambda">Lambda Value:</label>
            <input
              type="number"
              id="lambda"
              min={OPTION_CONSTRAINTS.lambda.min}
              max={OPTION_CONSTRAINTS.lambda.max}
              value={options.lambda}
              onChange={e => handleNumberChange('lambda', e.target.value)}
              required
              aria-describedby="lambda-description"
            />
            <div id="lambda-description" className="description">
              Controls the balance between compression ratio and quality. Higher values produce
              smaller files but lower quality.
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="level">Compression Level (1-5):</label>
            <input
              type="number"
              id="level"
              min={OPTION_CONSTRAINTS.level.min}
              max={OPTION_CONSTRAINTS.level.max}
              value={options.level}
              onChange={e => handleNumberChange('level', e.target.value)}
              required
              aria-describedby="level-description"
            />
            <div id="level-description" className="description">
              Higher levels produce better quality but take longer to compress.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MemoizedCompressionOptions = memo(CompressionOptions);
export { MemoizedCompressionOptions as CompressionOptions };
