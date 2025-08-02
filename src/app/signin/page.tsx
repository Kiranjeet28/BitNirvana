"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/custom-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Logged in successfully")
        window.location.href = "/dashboard"
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-pulse ${
              i % 4 === 0
                ? "bg-purple-400/40"
                : i % 4 === 1
                  ? "bg-blue-400/40"
                  : i % 4 === 2
                    ? "bg-cyan-400/40"
                    : "bg-indigo-400/40"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 shadow-2xl shadow-purple-500/10 transition-all duration-500 hover:shadow-purple-500/20 hover:border-purple-400/50 hover:bg-slate-900/70">
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-blue-500/20 via-cyan-500/20 to-indigo-500/20 opacity-0 transition-opacity duration-500 hover:opacity-100 blur-sm -z-10 animate-pulse"></div>

        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center relative z-10">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
            Welcome to QuickDesk
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <Mail
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                  focusedField === "email" ? "text-purple-400 scale-110" : "text-slate-400 group-hover:text-purple-300"
                }`}
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                required
                className="pl-12 h-14 bg-slate-800/50 text-white border-slate-600/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 placeholder:text-slate-400 hover:border-purple-300/50 hover:bg-slate-800/70 rounded-xl"
              />
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 transition-all duration-300 pointer-events-none ${
                  focusedField === "email" ? "opacity-100 scale-105" : "group-hover:opacity-50"
                }`}
              ></div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                  focusedField === "password" ? "text-blue-400 scale-110" : "text-slate-400 group-hover:text-blue-300"
                }`}
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                required
                className="pl-12 pr-12 h-14 bg-slate-800/50 text-white border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 placeholder:text-slate-400 hover:border-blue-300/50 hover:bg-slate-800/70 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 opacity-0 transition-all duration-300 pointer-events-none ${
                  focusedField === "password" ? "opacity-100 scale-105" : "group-hover:opacity-50"
                }`}
              ></div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group rounded-xl"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-blue-400/20 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
