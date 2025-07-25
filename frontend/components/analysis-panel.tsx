"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle, Info, Eye, Clock, Palette } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AnalysisPanelProps {
  result?: {
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
  isLoading?: boolean
}

export default function AnalysisPanel({ result, isLoading }: AnalysisPanelProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    if (!result?.motif_analysis?.description) return

    try {
      await navigator.clipboard.writeText(result.motif_analysis.description)
      setCopied(true)
      toast({
        title: "Successfully Copied",
        description: "Analysis text has been copied to clipboard",
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

  const getMotifDisplayName = (motif: string) => {
    const names = {
      ayam: "Chicken Motif",
      manusia: "Human Motif",
      uncertain: "Uncertain Classification",
    }
    return names[motif as keyof typeof names] || motif
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-100"
    if (confidence >= 75) return "text-blue-600 bg-blue-100"
    if (confidence >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  // Default content when no result
  const defaultContent = {
    title: "Sumba Textile Analysis",
    description:
      "Upload an image of Sumba textile to discover the cultural significance and symbolism of its motifs. Our AI will analyze the patterns and provide detailed insights into the traditional meanings, spiritual connections, and ceremonial uses of the identified motifs in Sumba culture.",
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-amber-800 text-center w-full">Analysis</h3>
          {result && (
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
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="text-center text-amber-600">
              <Clock className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Analyzing textile pattern...</p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Classification Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={`px-3 py-1 ${getConfidenceColor(result.confidence)}`}>
                  <Palette className="h-3 w-3 mr-1" />
                  {getMotifDisplayName(result.prediction)}
                </Badge>
                <span className="text-sm text-gray-500">{result.confidence.toFixed(1)}% confidence</span>
              </div>

              {result.is_uncertain && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Uncertain Classification</p>
                      <p className="text-sm text-yellow-700">{result.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Motif Analysis */}
            {result.motif_analysis && (
              <div className="space-y-4">
                <h4 className="font-semibold text-amber-800">{result.motif_analysis.title}</h4>
                <p className="text-gray-700 leading-relaxed text-sm">{result.motif_analysis.description}</p>

                {/* Cultural Context */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">Cultural Context</h5>
                  <p className="text-sm text-blue-700">{result.motif_analysis.cultural_context}</p>
                </div>

                {/* Symbolism */}
                {result.motif_analysis.symbolism && result.motif_analysis.symbolism.length > 0 && (
                  <div>
                    <h5 className="font-medium text-amber-800 mb-2">Symbolism</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {result.motif_analysis.symbolism.slice(0, 4).map((symbol, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full flex-shrink-0"></div>
                          <span>{symbol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Occasions */}
                {result.motif_analysis.usage_occasions && result.motif_analysis.usage_occasions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-amber-800 mb-2">Traditional Usage</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.motif_analysis.usage_occasions.slice(0, 3).map((occasion, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                          {occasion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Processing Info */}
            <div className="text-xs text-gray-500 text-center border-t pt-3">
              <div className="flex items-center justify-center gap-4">
                <span>Processed in {result.processing_time.toFixed(2)}s</span>
                <span>•</span>
                <span>AI Classification</span>
              </div>
            </div>
          </div>
        ) : (
          /* Default State */
          <div className="space-y-4">
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="font-semibold text-gray-700 mb-2">{defaultContent.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{defaultContent.description}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
