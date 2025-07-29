import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Helper function to get authenticated admin user
async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    const role = user.user_metadata?.role || 'staff'
    if (role !== 'admin') {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: role as 'admin'
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Get payment settings data from database
    const { data: paymentSettings, error } = await supabase
      .from('payment_settings')
      .select(`
        id,
        restaurant_id,
        cashfree_environment,
        is_payment_enabled,
        created_at,
        updated_at,
        restaurants (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payment settings data' },
        { status: 500 }
      )
    }

    // Process payment settings data for analytics
    const processedSettings = paymentSettings?.map(setting => ({
      id: setting.id,
      restaurantId: setting.restaurant_id,
      restaurantName: setting.restaurants?.name || 'Unknown Restaurant',
      environment: setting.cashfree_environment,
      isPaymentEnabled: setting.is_payment_enabled,
      createdAt: setting.created_at,
      updatedAt: setting.updated_at
    })) || []

    // Calculate analytics metrics
    const totalSettings = processedSettings.length
    const enabledPayments = processedSettings.filter(setting => setting.isPaymentEnabled).length
    const disabledPayments = totalSettings - enabledPayments

    // Group by environment
    const settingsByEnvironment = processedSettings.reduce((acc, setting) => {
      const env = setting.environment || 'Unknown'
      acc[env] = (acc[env] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by restaurant
    const settingsByRestaurant = processedSettings.reduce((acc, setting) => {
      if (!acc[setting.restaurantId]) {
        acc[setting.restaurantId] = {
          restaurantId: setting.restaurantId,
          restaurantName: setting.restaurantName,
          isPaymentEnabled: setting.isPaymentEnabled,
          environment: setting.environment,
          createdAt: setting.createdAt,
          updatedAt: setting.updatedAt
        }
      }
      return acc
    }, {} as Record<string, any>)

    // Recent configurations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentConfigurations = processedSettings.filter(
      setting => new Date(setting.createdAt) > thirtyDaysAgo
    )

    // Get all restaurants to calculate coverage
    const { data: allRestaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')

    if (restaurantError) {
      console.error('Error fetching restaurants for coverage calculation:', restaurantError)
    }

    const totalRestaurants = allRestaurants?.length || 0
    const paymentCoverage = totalRestaurants > 0 ? (totalSettings / totalRestaurants) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalSettings,
        enabledPayments,
        disabledPayments,
        paymentCoverage,
        totalRestaurants,
        settingsByEnvironment,
        settingsByRestaurant: Object.values(settingsByRestaurant),
        recentConfigurations,
        allSettings: processedSettings
      }
    })

  } catch (error) {
    console.error('Error in payment settings analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}