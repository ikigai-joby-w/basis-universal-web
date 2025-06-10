import React from 'react';
import { StatusMessageProps } from '../types';

export const StatusMessage: React.FC<StatusMessageProps> = ({ message, type }) => {
  if (!message) return null;

  return (
    <div id="status" className={type}>
      {message}
    </div>
  );
};
