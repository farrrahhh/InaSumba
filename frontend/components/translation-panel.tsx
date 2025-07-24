"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Globe, Loader2, Info, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface TranslationPanelProps {
  extractedText: string
  translatedText: string
  culturalNotes?: string
  selectedLanguage: "en" | "id"
  isLoading: boolean
  onLanguageChange: (language: "en" | "id") => void
}

export default function TranslationPanel({
  extractedText,
  translatedText,
  culturalNotes,
  selectedLanguage,
  isLoading,
  onLanguageChange,
}: TranslationPanelProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    if (!translatedText) return

    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
      toast({
        title: "Successfully Copied",
        description: "Translation text has been copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const getLanguageName = (code: "en" | "id") => {
    return code === "id" ? "Indonesia" : "English"
  }

  return (
    <div className="space-y-6">
      

      {/* Translation Box */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100">
        <CardContent className="p-6">
          {/* Language Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-xl p-1">
            <Button
              variant={selectedLanguage === "en" ? "default" : "ghost"}
              className={`flex-1 rounded-lg font-medium transition-all ${
                selectedLanguage === "en"
                  ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => onLanguageChange("en")}
            >
              English
            </Button>
            <Button
              variant={selectedLanguage === "id" ? "default" : "ghost"}
              className={`flex-1 rounded-lg font-medium transition-all ${
                selectedLanguage === "id"
                  ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => onLanguageChange("id")}
            >
              Indonesia
            </Button>
          </div>

          {/* Translation Content */}
          <div className="relative">
            <div className="min-h-[80px] p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                {isLoading
                  ? "Translating..."
                  : translatedText ||
                    (selectedLanguage === "en"
                      ? "The child is eating rice, the father is cooking"
                      : "Anak itu sedang makan nasi, ayah sedang memasak")}
              </p>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              </div>
            )}
          </div>

          {/* Translation Actions & Info */}
          {translatedText && (
            <div className="mt-4 space-y-3">
              {/* Language Badge & Copy Button */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getLanguageName(selectedLanguage)}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2 hover:bg-gray-50 bg-transparent"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Cultural Notes */}
              {culturalNotes && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Cultural Notes</p>
                      <p className="text-sm text-blue-700">{culturalNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Translation Stats */}
              <div className="text-xs text-gray-500 text-center">
                {translatedText.length} characters • Sumba → {getLanguageName(selectedLanguage)}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!extractedText && !isLoading && (
            <div className="mt-4 p-4 text-center text-gray-500">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enter Sumba text to start translation</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
