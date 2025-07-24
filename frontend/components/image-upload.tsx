"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  isLoading?: boolean
}

export default function ImageUpload({ onImageUpload, isLoading }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith("image/")) {
          onImageUpload(file)
        }
      }
    },
    [onImageUpload],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0])
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-green-100">
      <h1 className="text-3xl font-bold text-center text-amber-800 mb-8">Ina Talk</h1>

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          dragActive ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-amber-800 rounded-lg flex items-center justify-center">
            <FileImage className="w-8 h-8 text-white" />
            <Upload className="w-4 h-4 text-white ml-1 -mt-2" />
          </div>

          <div className="space-y-2">
            <p className="text-amber-800 font-medium">Drag Image</p>
            <p className="text-gray-500 text-sm">or</p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Upload Image"}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-600 mt-6 text-sm leading-relaxed">
        Drag or Upload image to translate Sumba Language into Indonesia or English
      </p>
    </div>
  )
}
