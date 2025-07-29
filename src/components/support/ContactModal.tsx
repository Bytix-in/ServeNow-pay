'use client'

import { useState } from 'react'
import { X, MessageCircle, Mail, Phone, Send, Loader2 } from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contactType: 'chat' | 'email' | 'phone'
}

export default function ContactModal({ isOpen, onClose, contactType }: ContactModalProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const contactInfo = {
    chat: {
      icon: MessageCircle,
      title: 'Start Live Chat',
      description: 'Get instant help from our support team',
      placeholder: 'Describe your issue and we\'ll help you right away...',
      buttonText: 'Start Chat'
    },
    email: {
      icon: Mail,
      title: 'Send Email',
      description: 'We\'ll respond within 24 hours',
      placeholder: 'Please describe your issue in detail. Include any error messages or steps you\'ve already tried...',
      buttonText: 'Send Email'
    },
    phone: {
      icon: Phone,
      title: 'Request Phone Call',
      description: 'We\'ll call you back within 2 hours',
      placeholder: 'Briefly describe your issue so our team can prepare for the call...',
      buttonText: 'Request Call'
    }
  }

  const currentContact = contactInfo[contactType]
  const IconComponent = currentContact.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)

    try {
      // Get user info from localStorage
      const userData = localStorage.getItem('user')
      const userInfo = userData ? JSON.parse(userData) : null

      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contactType,
          message: message.trim(),
          userInfo: {
            name: userInfo?.name || 'Unknown',
            email: userInfo?.email || 'Unknown',
            role: userInfo?.role || 'restaurant',
            restaurantId: userInfo?.restaurantId || null
          }
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
      } else {
        alert('Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              contactType === 'chat' ? 'bg-green-100' :
              contactType === 'email' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              <IconComponent className={`w-5 h-5 ${
                contactType === 'chat' ? 'text-green-600' :
                contactType === 'email' ? 'text-blue-600' : 'text-purple-600'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentContact.title}</h2>
              <p className="text-sm text-gray-600">{currentContact.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 mb-4">
                {contactType === 'chat' && 'Our team will start a chat with you shortly.'}
                {contactType === 'email' && 'We\'ll respond to your email within 24 hours.'}
                {contactType === 'phone' && 'We\'ll call you back within 2 hours during business hours.'}
              </p>
              <button
                onClick={onClose}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={currentContact.placeholder}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {contactType === 'phone' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Please ensure your phone number in your profile is up to date. 
                    We'll call you during business hours (Mon-Fri, 9 AM - 6 PM).
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition flex items-center justify-center gap-2 ${
                    contactType === 'chat' ? 'bg-green-600 hover:bg-green-700' :
                    contactType === 'email' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {currentContact.buttonText}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}