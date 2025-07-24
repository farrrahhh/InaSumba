"use client"

import { useState } from "react"
import Image from "next/image"
import TextInputPanel from "@/components/text-input"
import TranslationPanel from "@/components/translation-panel"
import BottomNavbar from "@/components/bottom-navbar"
import { translateText } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [sumbaText, setSumbaText] = useState<string>("")
  const [translatedText, setTranslatedText] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "id">("id")
  const [isLoading, setIsLoading] = useState(false)
  const [culturalNotes, setCulturalNotes] = useState<string>("")
  const { toast } = useToast()

  const handleTranslate = async (text: string) => {
    if (!text.trim()) {
      setTranslatedText("")
      setCulturalNotes("")
      return
    }

    setIsLoading(true)
    try {
      const result = await translateText(text.trim(), selectedLanguage)
      setTranslatedText(result.translated_text)
      setCulturalNotes(result.cultural_notes || "")

      toast({
        title: "Translation Complete",
        description: `Completed in ${result.processing_time.toFixed(2)}s`,
      })
    } catch (error) {
      console.error("Translation error:", error)
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
      setTranslatedText("")
      setCulturalNotes("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = async (language: "en" | "id") => {
    setSelectedLanguage(language)

    if (sumbaText.trim() && !isLoading) {
      setIsLoading(true)
      try {
        const result = await translateText(sumbaText.trim(), language)
        setTranslatedText(result.translated_text)
        setCulturalNotes(result.cultural_notes || "")
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

  const handleTextChange = (text: string) => {
    setSumbaText(text)
    if (text.trim()) {
      const timeoutId = setTimeout(() => {
        handleTranslate(text)
      }, 800)
      return () => clearTimeout(timeoutId)
    } else {
      setTranslatedText("")
      setCulturalNotes("")
    }
  }

  const handleClearText = () => {
    setSumbaText("")
    setTranslatedText("")
    setCulturalNotes("")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.jpg" alt="Nature Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-green-100/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start lg:justify-center gap-8">
            {/* Left - Input */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-green-100">
                <h1 className="text-3xl font-bold text-center text-amber-800 mb-8">Ina Talk</h1>
                <TextInputPanel
                  sumbaText={sumbaText}
                  onTextChange={handleTextChange}
                  onClearText={handleClearText}
                  isLoading={isLoading}
                />
                <p className="text-center text-gray-600 mt-6 text-sm leading-relaxed">
                  Type or paste Sumba language text to translate into Indonesia or English
                </p>
              </div>
            </div>

            {/* Right - Output */}
            <div className="w-full lg:w-1/2">
              <TranslationPanel
                extractedText={sumbaText}
                translatedText={translatedText}
                culturalNotes={culturalNotes}
                selectedLanguage={selectedLanguage}
                isLoading={isLoading}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNavbar />
    </div>
  )
}
