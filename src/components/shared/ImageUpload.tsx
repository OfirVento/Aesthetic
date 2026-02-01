"use client";

import { useRef } from "react";

interface ImageUploadProps {
  onUpload: (dataUrl: string) => void;
  children: React.ReactNode;
  className?: string;
}

export default function ImageUpload({
  onUpload,
  children,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <button className={className} onClick={() => fileInputRef.current?.click()}>
        {children}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </>
  );
}
