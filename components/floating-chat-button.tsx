"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, X } from "lucide-react"

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <Link
        href="/chatbot"
        className="fixed bottom-16 right-6 z-40 inline-flex items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <div className="group relative">
          {/* Pulse Effect */}
          <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse opacity-20 group-hover:opacity-30 transition-opacity"></div>

          {/* Main Button */}
          <button className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Badge */}
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Need help? Chat with us
          <div className="absolute top-full right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </Link>
    </>
  )
}
