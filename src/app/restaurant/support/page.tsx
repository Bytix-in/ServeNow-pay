'use client'

import { useState } from 'react'
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  Mail,
  HelpCircle,
  Clock,
  CheckCircle
} from 'lucide-react'
import ContactModal from '@/components/support/ContactModal'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  // Order Management
  {
    id: '1',
    category: 'Order Management',
    question: 'How do I accept or reject incoming orders?',
    answer: 'Go to the Orders section in your dashboard. You\'ll see all pending orders with Accept/Reject buttons. Click Accept to confirm the order and start preparation, or Reject if you cannot fulfill it. Customers will be notified immediately of your decision.'
  },
  {
    id: '2',
    category: 'Order Management',
    question: 'How do I update order status during preparation?',
    answer: 'In the Orders section, find the accepted order and use the status dropdown to update: "Preparing" → "Ready for Pickup/Delivery" → "Completed". This keeps customers informed about their order progress.'
  },
  {
    id: '3',
    category: 'Order Management',
    question: 'What should I do if I need to cancel an accepted order?',
    answer: 'Contact the customer immediately through the order details page, then mark the order as cancelled. The customer will receive an automatic refund. Try to provide a reason for the cancellation.'
  },

  // Menu Management
  {
    id: '4',
    category: 'Menu Management',
    question: 'How do I add new dishes to my menu?',
    answer: 'Go to Food Menu → Add New Dish. Fill in the dish name, description, price, category, and upload an appetizing photo. Make sure to set availability status and any dietary information before saving.'
  },
  {
    id: '5',
    category: 'Menu Management',
    question: 'How do I temporarily disable a dish that\'s out of stock?',
    answer: 'In the Food Menu section, find the dish and toggle the "Available" switch to off. The dish will be grayed out for customers but remain in your menu for easy reactivation later.'
  },
  {
    id: '6',
    category: 'Menu Management',
    question: 'Can I set different prices for different times of day?',
    answer: 'Currently, our system supports fixed pricing. However, you can create separate menu items for special time-based offers (like "Lunch Special Burger") with different prices and availability hours.'
  },

  // Payment & Billing
  {
    id: '7',
    category: 'Payment & Billing',
    question: 'When do I receive payments from orders?',
    answer: 'Payments are processed automatically and transferred to your registered bank account within 2-3 business days after order completion. You can track all payments in the Payments section.'
  },
  {
    id: '8',
    category: 'Payment & Billing',
    question: 'What are the commission charges?',
    answer: 'Our platform charges a competitive commission rate on each completed order. Detailed breakdown is available in your Payments section under "Transaction History" with transparent fee structure.'
  },
  {
    id: '9',
    category: 'Payment & Billing',
    question: 'How do I update my bank account details?',
    answer: 'Go to Settings → Payment Settings. You can update your bank account information, but changes require verification and may take 24-48 hours to process for security reasons.'
  },

  // Staff Management
  {
    id: '10',
    category: 'Staff Management',
    question: 'How do I add staff members to help manage orders?',
    answer: 'In the Staff section, click "Add Staff Member". Enter their details and assign roles (Order Manager, Kitchen Staff, etc.). They\'ll receive login credentials to access relevant sections of the dashboard.'
  },
  {
    id: '11',
    category: 'Staff Management',
    question: 'Can I limit what staff members can access?',
    answer: 'Yes! When adding staff, you can set role-based permissions. For example, Kitchen Staff can only update order status, while Managers can access all sections including payments and menu management.'
  },

  // Technical Issues
  {
    id: '12',
    category: 'Technical Issues',
    question: 'The dashboard is loading slowly. What should I do?',
    answer: 'Try refreshing your browser first. If the issue persists, clear your browser cache and cookies. For persistent problems, check your internet connection or try accessing from a different browser.'
  },
  {
    id: '13',
    category: 'Technical Issues',
    question: 'I\'m not receiving order notifications. How do I fix this?',
    answer: 'Check your browser notification settings and ensure they\'re enabled for our platform. Also verify your email and phone number in Settings are correct. You can test notifications in Settings → Notification Preferences.'
  },
  {
    id: '14',
    category: 'Technical Issues',
    question: 'How do I reset my password?',
    answer: 'On the login page, click "Forgot Password" and enter your registered email. You\'ll receive a password reset link. If you don\'t receive it within 10 minutes, check your spam folder or contact support.'
  },

  // Customer Service
  {
    id: '15',
    category: 'Customer Service',
    question: 'How do I handle customer complaints?',
    answer: 'Check the Feedback section regularly for customer reviews and complaints. Respond professionally and promptly. For serious issues, you can contact our support team to help mediate and find solutions.'
  },
  {
    id: '16',
    category: 'Customer Service',
    question: 'A customer wants to modify their order after placing it. What should I do?',
    answer: 'If the order hasn\'t started preparation, you can contact the customer through the order details page to discuss modifications. For significant changes, it\'s better to cancel and have them place a new order.'
  },

  // Account & Settings
  {
    id: '17',
    category: 'Account & Settings',
    question: 'How do I update my restaurant information and photos?',
    answer: 'Go to Settings → Restaurant Profile. You can update your restaurant name, description, contact details, operating hours, and upload new photos. Changes are reviewed and updated within 24 hours.'
  },
  {
    id: '18',
    category: 'Account & Settings',
    question: 'How do I set my restaurant\'s operating hours?',
    answer: 'In Settings → Operating Hours, you can set different hours for each day of the week. You can also set special hours for holidays or temporary closures. This automatically affects order availability.'
  }
]

const categories = Array.from(new Set(faqs.map(faq => faq.category)))

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean
    type: 'chat' | 'email' | 'phone'
  }>({ isOpen: false, type: 'chat' })

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const openContactModal = (type: 'chat' | 'email' | 'phone') => {
    setContactModal({ isOpen: true, type })
  }

  const closeContactModal = () => {
    setContactModal({ isOpen: false, type: 'chat' })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600">Find answers to common questions and get help</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4 mb-8">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No FAQs found matching your search.</p>
          </div>
        ) : (
          filteredFAQs.map(faq => (
            <div key={faq.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                    {faq.category}
                  </span>
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                </div>
                {expandedFAQ === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedFAQ === faq.id && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600">Our support team is here to assist you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Get instant help from our support team</p>
            <button 
              onClick={() => openContactModal('chat')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-3">We'll respond within 24 hours</p>
            <button 
              onClick={() => openContactModal('email')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Send Email
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-3">Mon-Fri, 9 AM - 6 PM</p>
            <button 
              onClick={() => openContactModal('phone')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
            >
              Request Call
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Support Hours</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={closeContactModal}
        contactType={contactModal.type}
      />
    </div>
  )
}