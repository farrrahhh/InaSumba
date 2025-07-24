"use client"

import { useState } from "react"
import Image from "next/image"
import ImageUploadClassifier from "@/components/image-upload-classifier"
import AnalysisPanel from "../../components/analysis-panel"
import BottomNavbar from "@/components/bottom-navbar"
import { classifyTenun } from "@/lib/classifier-api"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  type ClassificationResult = {
    prediction: string
    confidence: number
    is_uncertain: boolean
    motif_analysis?: {
      title: string
      description: string
      symbolism: string[]
      cultural_context: string
      usage_occasions: string[]
    }
    probabilities: Record<string, number>
    recommendation?: string
    processing_time: number
  }

  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    setClassificationResult(null)

    try {
      const result = await classifyTenun(file)
      setClassificationResult(result)

      toast({
        title: "Classification Complete",
        description: `Identified ${result.prediction} motif with ${result.confidence.toFixed(1)}% confidence`,
      })
    } catch (error) {
      console.error("Classification error:", error)
      toast({
        title: "Classification Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
                <ImageUploadClassifier onImageUpload={handleImageUpload} isLoading={isLoading} />
              </div>
            </div>

            {/* Right Side - Analysis */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <AnalysisPanel result={classificationResult ?? undefined} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>await fetch

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  )
}
