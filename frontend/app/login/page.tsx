'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data: { user_id: string; name: string; email: string; detail?: string } = await response.json()

      if (response.ok) {
        login({
          user_id: data.user_id,
          name: data.name,
          email: data.email
        })
        
        localStorage.setItem('user_id', data.user_id)
        localStorage.setItem('name', data.name)
        localStorage.setItem('email', data.email)
        // save udah login belum
        localStorage.setItem('isLoggedIn', 'true')
        router.push('/home')
      } else {
        setError(data.detail || 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen md:hidden relative flex items-center justify-center px-8 flex-col bg-gradient-to-b from-[#D1A266] to-[#6B5334]">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-10 z-0"
          style={{ backgroundImage: "url('/bg-login.png')" }}
        ></div>

        <div className="relative z-10 text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">
            InaSumba
          </h1>
          <p className="text-lg font-light opacity-90">
            Weaving The Cultures of Sumba 
          </p>
        </div>

        <div className="relative z-10 w-full max-w-sm bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl text-center text-zinc-700 font-semibold mb-6">LOGIN</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium mb-1 text-gray-500">Email</label>
          <input
            type="email"
            className="w-full mb-4 p-2 rounded border border-gray-400 text-gray-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1 text-gray-500">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 rounded border border-gray-400 text-gray-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2 right-2 text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            className="w-full bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition disabled:opacity-50"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Dont have an account? </span>
            <a href="/register" className="text-sm text-zinc-800 underline font-medium">
              Sign Up
            </a>
          </div>
        </div>
      </div>

      <div className="hidden md:flex min-h-screen">
        <div className="relative flex-1 bg-gradient-to-br from-[#D1A266] via-[#C4965A] to-[#6B5334] flex items-center justify-center p-8">
          <div
            className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-20"
            style={{ backgroundImage: "url('/bg-login.png')" }}
          ></div>

          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              InaSumba
            </h1>
            <p className="text-xl lg:text-2xl font-light opacity-90">
              Weaving The Cultures of Sumba 
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                LOGIN
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D1A266] focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-500 rounded-lg focus:ring-2 focus:ring-[#D1A266] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              
              <div className="text-center">
                <span className="text-sm text-gray-600">Dont have an account? </span>
                <a 
                  href="/register" 
                  className="text-sm text-gray-900 hover:text-gray-700 underline font-medium transition-colors"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}