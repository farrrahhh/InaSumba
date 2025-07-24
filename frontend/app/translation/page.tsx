"use client"

import { useState } from "react"
import Image from "next/image"

import ImageUpload from "../../components/image-upload"
import TranslationPanel from "../../components/translation-panel"
import BottomNavbar from "../../components/bottom-navbar"
import { uploadAndTranslate } from "@/lib/api"
import { useToast } from "../../hooks/use-toast"

export default function HomePage() {
  const [extractedText, setExtractedText] = useState<string>("")
  const [translatedText, setTranslatedText] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "id">("en")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const result = await uploadAndTranslate(file, selectedLanguage)
      setExtractedText(result.extracted_text)
      setTranslatedText(result.translated_text)

      toast({
        title: "Translation Complete",
        description: `Processed in ${result.processing_time.total_time.toFixed(2)}s`,
      })
    } catch (error) {
      console.error("Translation error:", error)
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = async (language: "en" | "id") => {
    setSelectedLanguage(language)

    // If we have extracted text, re-translate it
    if (extractedText && !isLoading) {
      setIsLoading(true)
      try {
        const { translateText } = await import("@/lib/api")
        const result = await translateText(extractedText, language)
        setTranslatedText(result.translated_text)
      } catch (error) {
        console.error("Re-translation error:", error)
        toast({
          title: "Translation Failed",
          description: "Failed to translate to selected language",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Nature Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-green-100/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Side - Image Upload */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
              </div>
            </div>

            {/* Right Side - Translation */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <TranslationPanel
                  extractedText={extractedText}
                  translatedText={translatedText}
                  isLoading={isLoading}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  )
}
