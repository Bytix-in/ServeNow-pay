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

    // Get orders data from database with debugging
    console.log('🔍 Fetching orders from database...')
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        restaurant_id,
        customer_name,
        total_amount,
        status,
        payment_status,
        created_at,
        updated_at,
        restaurants (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders data' },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${orders?.length || 0} orders in database`)
    if (orders && orders.length > 0) {
      console.log('💰 Sample order data:', {
        id: orders[0].id,
        restaurant_id: orders[0].restaurant_id,
        total_amount: orders[0].total_amount,
        status: orders[0].status
      })
    }

    // Process orders data for analytics
    const processedOrders = orders?.map(order => ({
      id: order.id,
      restaurantId: order.restaurant_id,
      restaurantName: order.restaurants?.name || 'Unknown Restaurant',
      customerName: order.customer_name,
      totalAmount: order.total_amount,
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })) || []

    // Calculate analytics metrics with debugging
    const totalOrders = processedOrders.length
    const totalRevenue = processedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    console.log('📈 Calculated metrics:', {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      sampleAmounts: processedOrders.slice(0, 3).map(o => o.totalAmount)
    })

    // Group by restaurant
    const ordersByRestaurant = processedOrders.reduce((acc, order) => {
      if (!acc[order.restaurantId]) {
        acc[order.restaurantId] = {
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          totalOrders: 0,
          totalRevenue: 0,
          orders: []
        }
      }
      acc[order.restaurantId].totalOrders++
      acc[order.restaurantId].totalRevenue += order.totalAmount
      acc[order.restaurantId].orders.push(order)
      return acc
    }, {} as Record<string, any>)

    // Group by status
    const ordersByStatus = processedOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentOrders = processedOrders.filter(
      order => new Date(order.createdAt) > sevenDaysAgo
    )

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByRestaurant: Object.values(ordersByRestaurant),
        ordersByStatus,
        recentOrders,
        allOrders: processedOrders
      }
    })

  } catch (error) {
    console.error('Error in orders analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}