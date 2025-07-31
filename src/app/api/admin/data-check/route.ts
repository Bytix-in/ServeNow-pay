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

    console.log('🔍 Checking database for actual data...')

    // Check restaurants
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, status, created_at')
      .limit(5)

    // Check orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, restaurant_id, total_amount, status, created_at')
      .limit(5)

    // Check menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, restaurant_id, name, price')
      .limit(5)

    // Check staff
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, restaurant_id, name, role')
      .limit(5)

    // Get counts
    const [
      { count: restaurantCount },
      { count: orderCount },
      { count: menuItemCount },
      { count: staffCount }
    ] = await Promise.all([
      supabase.from('restaurants').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('menu_items').select('*', { count: 'exact', head: true }),
      supabase.from('staff').select('*', { count: 'exact', head: true })
    ])

    // Calculate total revenue
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    const result = {
      success: true,
      counts: {
        restaurants: restaurantCount || 0,
        orders: orderCount || 0,
        menuItems: menuItemCount || 0,
        staff: staffCount || 0
      },
      totalRevenue,
      sampleData: {
        restaurants: restaurants?.map(r => ({ id: r.id, name: r.name, status: r.status })) || [],
        orders: orders?.map(o => ({ 
          id: o.id, 
          restaurant_id: o.restaurant_id, 
          amount: o.total_amount, 
          status: o.status 
        })) || [],
        menuItems: menuItems?.map(m => ({ 
          id: m.id, 
          restaurant_id: m.restaurant_id, 
          name: m.name, 
          price: m.price 
        })) || [],
        staff: staff?.map(s => ({ 
          id: s.id, 
          restaurant_id: s.restaurant_id, 
          name: s.name, 
          role: s.role 
        })) || []
      },
      errors: {
        restaurants: restaurantError?.message || null,
        orders: orderError?.message || null,
        menuItems: menuError?.message || null,
        staff: staffError?.message || null
      }
    }

    console.log('📊 Database check results:', {
      counts: result.counts,
      totalRevenue: result.totalRevenue,
      hasData: {
        restaurants: result.counts.restaurants > 0,
        orders: result.counts.orders > 0,
        menuItems: result.counts.menuItems > 0,
        staff: result.counts.staff > 0
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}