'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'

import { Eye, EyeOff } from "lucide-react"
import Image from 'next/image'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const login = useAuthStore((s) => s.login)


  const handleRegister = async () => {
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setError('')

    let hasError = false

    if (!name) {
      setNameError('Name is required')
      hasError = true
    }

    if (!email) {
      setEmailError('Email is required')
      hasError = true
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setEmailError('Invalid email format')
        hasError = true
      }
    }

    if (!password) {
      setPasswordError('Password is required')
      hasError = true
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      hasError = true
    }

    if (hasError) return

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (response.ok) {
        login({ user_id: data.user_id, name: data.name, email: data.email })
        router.push('/login')
      } else {
        setError(data.detail || 'Registration failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')


  return (
    <>
      <div className="min-h-screen md:hidden relative flex items-center justify-center px-8 flex-col bg-gradient-to-b from-[#D1A266] to-[#6B5334]">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-10 z-0"
          style={{ backgroundImage: "url('/bg-login.png')" }}
        ></div>

        <div className="relative z-10 flex flex-col items-center">
         <Image src="/images/logo.png" alt="InaSumba Logo" width={80} height={80} className="w-20 h-20 mb-4" />
        </div>

        <div className="relative z-10 w-full max-w-sm bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl text-center text-zinc-700 font-semibold mb-6">REGISTER</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium mb-1 text-gray-500">Name</label>
          <input
            type="text"
            className="w-full mb-4 p-2 rounded border text-gray-500 border-gray-400 placeholder:font-medium"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}

          <label className="block text-sm font-medium mb-1 text-gray-500">Email</label>
          <input
            type="email"
            className="w-full mb-4 p-2 rounded text-gray-500 border border-gray-400 placeholder:font-medium"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1 text-gray-500">Password</label>
         <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={`w-full px-4 py-3 border rounded-lg text-gray-500 placeholder:font-medium focus:ring-2 focus:ring-[#D1A266] focus:border-transparent outline-none transition-all ${
              passwordError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your password"
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
          {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
        </div>


          <button
            className="w-full bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition disabled:opacity-50"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-black underline">
              Already have an account?
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
            <Image
              src="/images/logo.png"
              alt="InaSumba Logo"
              width={480}
              height={480}
              className="mb-16 w-[480px] h-[480px]"
              priority
              />
          </div>
        </div>

        <div className="flex-1 bg-white flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                REGISTER
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D1A266] focus:border-transparent outline-none transition-all placeholder:font-medium"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
                
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg text-gray-500 placeholder:font-medium focus:ring-2 focus:ring-[#D1A266] focus:border-transparent outline-none transition-all ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}

              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-500 placeholder:font-medium focus:ring-2 focus:ring-[#D1A266] focus:border-transparent outline-none transition-all ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your password (min. 6 characters)"
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
                {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              </div>

              </div>

              <button
                type="button"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="text-center">
                <a 
                  href="/login" 
                  className="text-sm text-gray-900 hover:text-gray-700 underline transition-colors"
                >
                  Already have an account?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}