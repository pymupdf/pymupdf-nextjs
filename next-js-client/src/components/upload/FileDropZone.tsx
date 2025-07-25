'use client'

import { useRef, useState } from 'react';

interface Props {
  onFilesDropped: (files: File[]) => Promise<void>;
};

const FileDropZone: React.FC<Props> = ({ onFilesDropped }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onFilesDropped(Array.from(event.dataTransfer.files));
    setIsDragging(false);
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleClick = () => inputRef.current?.click();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    if (files === null) {
        return;
    }
    onFilesDropped(Array.from(files));
    resetRef.current?.click();
  };

  return (
    <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
            border: isDragging ? '1px dashed #EFF6FF' : '1px dashed #FFFFFF',
            backgroundColor: isDragging ? '#666666' : '',
        }}
        className={`w-full h-full border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-300 flex justify-center items-center`}
    >
        <p className="text-(--foreground-rgb)">Drag and drop documents here, or click to upload.</p>
        <form className='hidden'>
            <input
                ref={inputRef}
                type="file"
                multiple
                onChange={handleInputChange}
            />
            <input 
                ref={resetRef}
                type='reset'
            />
        </form>
    </div>
  );
};

export default FileDropZone;
