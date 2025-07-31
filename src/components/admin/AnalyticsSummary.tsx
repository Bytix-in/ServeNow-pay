'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Store,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Users,
  Activity
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  delay?: number
}

function MetricCard({ title, value, change, icon, color, delay = 0 }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center">
              {change.type === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">{change.period}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

interface AnalyticsSummaryProps {
  metrics: {
    totalRestaurants: number
    activeRestaurants: number
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    paymentEnabledRestaurants: number
    loggedInRestaurants: number
    totalStaff: number
  }
}

export default function AnalyticsSummary({ metrics }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Restaurants"
        value={metrics.totalRestaurants}
        change={{
          value: 12,
          type: 'increase',
          period: 'vs last month'
        }}
        icon={<Store className="h-6 w-6" />}
        color="blue"
        delay={0}
      />
      
      <MetricCard
        title="Total Revenue"
        value={`$${metrics.totalRevenue.toLocaleString()}`}
        change={{
          value: 8.2,
          type: 'increase',
          period: 'vs last month'
        }}
        icon={<DollarSign className="h-6 w-6" />}
        color="green"
        delay={0.1}
      />
      
      <MetricCard
        title="Total Orders"
        value={metrics.totalOrders}
        change={{
          value: 15.3,
          type: 'increase',
          period: 'vs last month'
        }}
        icon={<ShoppingBag className="h-6 w-6" />}
        color="purple"
        delay={0.2}
      />
      
      <MetricCard
        title="Active Now"
        value={`${metrics.loggedInRestaurants}/${metrics.totalRestaurants}`}
        change={{
          value: 5.1,
          type: 'increase',
          period: 'vs yesterday'
        }}
        icon={<Activity className="h-6 w-6" />}
        color="orange"
        delay={0.3}
      />
    </div>
  )
}