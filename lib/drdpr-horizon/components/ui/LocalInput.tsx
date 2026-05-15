import React, { useState, useEffect } from 'react';

interface LocalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
}

export function LocalInput({ value, onChange, onBlur, ...props }: LocalInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync external value when it changes, but only if we are not actively focusing it
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (localValue !== value) {
      onChange(localValue);
    }
    if (onBlur) onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Triggers handleBlur
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

export function LocalTextArea({ value, onChange, onBlur, ...props }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & { value: string, onChange: (val: string) => void }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (localValue !== value) {
      onChange(localValue);
    }
    if (onBlur) onBlur(e);
  };

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
}
