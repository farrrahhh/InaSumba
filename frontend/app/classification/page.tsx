"use client"

import { useState } from "react"
import Image from "next/image"
import ImageUploadClassifier from "@/components/image-upload-classifier"
import AnalysisPanel from "../../components/analysis-panel"
import BottomNavbar from "@/components/bottom-navbar"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

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

  const handleImageUpload = async () => {
    setIsLoading(true)
    setClassificationResult(null)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Default classification result (matching backend response)
      const result: ClassificationResult = {
        prediction: "ayam",
        confidence: 85.5,
        is_uncertain: false,
        motif_analysis: {
          title: "Chicken Motif in Sumba Weaving",
          description: "The chicken motif in Sumba woven cloth symbolizes fertility, new life, and spiritual connection between humans and ancestors. In Sumba tradition, chickens are often used in traditional ceremonies as offerings or spiritual communication media, making them an important symbol in religious and social life. The crowing of the rooster marking the arrival of morning is also interpreted as a symbol of hope, vigilance, and protection from darkness. Additionally, this motif represents certain social status within Sumba's customary structure, where its use often indicates clan identity or hereditary legacy.",
          symbolism: [
            "Fertility and new life",
            "Spiritual connection with ancestors",
            "Communication medium in traditional ceremonies",
            "Symbol of hope and protection",
            "Vigilance against darkness",
            "Social status and clan identity",
            "Hereditary legacy",
          ],
          cultural_context: "Chickens in Sumba culture play an important role in religious rituals and traditional ceremonies, often used as offerings to Marapu (ancestors).",
          usage_occasions: [
            "Traditional wedding ceremonies",
            "Marapu religious rituals",
            "Harvest celebrations",
            "Initiation ceremonies",
            "Important family events",
          ],
        },
        probabilities: {
          ayam: 0.855,
          manusia: 0.145,
        },
        processing_time: 0.15,
      }

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
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (isLoggedIn !== "true") {
      window.location.href = "/login"
      return
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.jpg" alt="Nature Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-green-100/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Left - Image Upload */}
            <div className="w-full lg:w-1/2">
             
                <ImageUploadClassifier onImageUpload={handleImageUpload} isLoading={isLoading} />
                
              
            </div>

            {/* Right - Analysis */}
            <div className="w-full lg:w-1/2 flex items-start justify-center">
              <div className="w-full">
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
