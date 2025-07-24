"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TranslationPanelProps {
  extractedText?: string
  translatedText?: string
  isLoading?: boolean
  onLanguageChange?: (language: "en" | "id") => void
}

export default function TranslationPanel({
  extractedText = "Ana ndia nyuku mangu, ama ndia wulang",
  translatedText = "The child is eating rice, the father is cooking",
  isLoading = false,
  onLanguageChange,
}: TranslationPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "id">("en")

  const handleLanguageChange = (language: "en" | "id") => {
    setSelectedLanguage(language)
    onLanguageChange?.(language)
  }

  return (
    <div className="space-y-6">
      {/* Sumba Language Box */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
        <h3 className="text-lg font-bold text-amber-800 mb-4">Sumba Language</h3>
        <div className="min-h-[80px] p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-700 leading-relaxed">{isLoading ? "Extracting text..." : extractedText}</p>
        </div>
      </Card>

      {/* Translation Box */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
        {/* Language Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-xl p-1">
          <Button
            variant={selectedLanguage === "en" ? "default" : "ghost"}
            className={`flex-1 rounded-lg font-medium transition-all ${
              selectedLanguage === "en" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleLanguageChange("en")}
          >
            English
          </Button>
          <Button
            variant={selectedLanguage === "id" ? "default" : "ghost"}
            className={`flex-1 rounded-lg font-medium transition-all ${
              selectedLanguage === "id" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleLanguageChange("id")}
          >
            Indonesia
          </Button>
        </div>

        {/* Translation Content */}
        <div className="min-h-[80px] p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-700 leading-relaxed">{isLoading ? "Translating..." : translatedText}</p>
        </div>
      </Card>
    </div>
  )
}
