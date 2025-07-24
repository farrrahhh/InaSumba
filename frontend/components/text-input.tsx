"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X, Languages, Loader2 } from "lucide-react"

interface TextInputPanelProps {
  sumbaText: string
  onTextChange: (text: string) => void
  onClearText: () => void
  isLoading: boolean
}

export default function TextInputPanel({ sumbaText, onTextChange, onClearText, isLoading }: TextInputPanelProps) {
  const [localText, setLocalText] = useState(sumbaText)

  useEffect(() => {
    setLocalText(sumbaText)
  }, [sumbaText])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localText !== sumbaText) {
        onTextChange(localText)
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [localText, sumbaText, onTextChange])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
  }

  const maxLength = 5000
  const currentLength = localText.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-amber-700" />
          <span className="font-medium text-amber-800">Sumba Language</span>
        </div>
        {localText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearText}
            className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Text Input Area */}
      <div className="relative">
        <Textarea
          value={localText}
          onChange={handleTextChange}
          placeholder="Ana ndia nyuku mangu, ama ndia wulang..."
          className="min-h-[200px] resize-none border-amber-200 focus:border-amber-400 focus:ring-amber-400 bg-gray-50 text-gray-800 placeholder:text-gray-500"
          maxLength={maxLength}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute top-2 right-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          </div>
        )}
      </div>

      {/* Character Counter */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">{currentLength > 0 && `${currentLength}/${maxLength} characters`}</span>
        {currentLength > maxLength * 0.9 && <span className="text-orange-500 font-medium">Approaching limit</span>}
      </div>

      {/* Helper Text */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-700">
          <strong>Tip:</strong> Translation will start automatically after you finish typing. Provide additional context
          if needed for more accurate results.
        </p>
      </div>
    </div>
  )
}
