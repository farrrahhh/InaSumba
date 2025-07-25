"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Volume2, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Message {
  id: string
  sender: "user" | "bot"
  message: string
  timestamp: Date
  isTyping?: boolean
}

interface ChatResponse {
  bot_response: string
  conversation_id: number
  character_name: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [isTTSEnabled, setIsTTSEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id") || "3C69BD32"
    setUserId(storedUserId)

    const initialMessage: Message = {
      id: "initial",
      sender: "bot",
      message:
        "Hi, I'm Ina Na from Sumba. I'd love to share stories about our ikat weaving and rich culture. Is there anything you'd like to ask?",
      timestamp: new Date(),
    }
    setMessages([initialMessage])
  }, [])
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (isLoggedIn !== "true") {
      window.location.href = "/login"
      return
    }
  }, [])

  // Improved scroll to bottom function
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        })
      }
      
      // Alternative method if scrollIntoView doesn't work well
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !userId) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      message: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    const typingMessage: Message = {
      id: "typing",
      sender: "bot",
      message: "Ina Na is typing..",
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages((prev) => [...prev, typingMessage])

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: userMessage.message, 
          user_id: userId, 
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const data: ChatResponse = await response.json()

      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        message: data.bot_response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      if (isTTSEnabled) {
        await playTTS(data.bot_response)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        sender: "bot",
        message: "Sorry, an error occurred. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const playTTS = async (text: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice: "nova", 
          language: "en",
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.play()
        }
      } else {
        console.error("TTS Error:", await response.text())
      }
    } catch (error) {
      console.error("TTS Error:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
          <Image
            src="/images/mobile.png"
            alt="Traditional Javanese Palace Background - Mobile"
            fill
            className="object-cover"
            priority
          />

        <div className="hidden md:block absolute inset-0">
          <Image
            src="/images/bg-dekstop-chatbot-ina.png"
            alt="Traditional Javanese Palace Background - Desktop"
            fill
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-30 flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <Image
              src="/images/pp.png"
              alt="INA NA"
              width={35}
              height={35}
              className="w-10 h-10 rounded-full object-cover aspect-square"
              priority
              />
              <div>
              <h1 className="text-white font-semibold text-lg">Ina Na</h1>
              <p className="text-white/70 text-sm">Online</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsTTSEnabled(!isTTSEnabled)}
          >
            {isTTSEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </header>

        <div className="flex-1 relative z-30 flex flex-col md:flex-row min-h-0">
          <div className="hidden md:flex md:w-60 md:items-end md:pl-6 relative flex-shrink-0">
            <Image
              src="/images/nametag.png"
              alt="Nametag"
              width={120}
              height={120}
              className="absolute left-25 top-3/5 -translate-y-1/2 -translate-x-1/2 z-50"
            />

            <Image
              src="/images/INA-NA.gif"
              alt="Ina Na"
              width={240}
              height={360}
              className="w-60 h-auto"
              priority={false}
            />
          </div>

          {/* Chat messages container with proper scrolling */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            style={{ 
              scrollBehavior: 'smooth',
              maxHeight: 'calc(100vh - 160px)' // Adjust based on header and input heights
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`relative z-30 flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-start space-x-2 max-w-[80%] md:max-w-[60%]">
                    {message.sender === "bot" && (
                    <div className="w-8 h-8 flex-shrink-0 mt-1 rounded-full overflow-hidden bg-white">
                      <Image
                      src="/images/pp.png"
                      alt="Ina Na"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      />
                    </div>
                    )}

                  <div className="flex flex-col">
                    <div
                      className={`p-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-white text-black rounded-br-md"
                          : message.isTyping
                          ? "bg-gray-600/80 text-white animate-pulse"
                          : "bg-[#FEF0A0] text-black rounded-bl-md backdrop-blur-sm"
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed break-words">
                        {message.message}
                      </p>
                    </div>

                    <span
                      className={`text-xs text-white/60 mt-1 ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input container */}
        <div className="p-4 bg-black/20 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-2 bg-white/90 rounded-full px-4 py-2">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me something..."
              className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}