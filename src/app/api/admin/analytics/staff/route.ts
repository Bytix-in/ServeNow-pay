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

    // Get staff data from database
    const { data: staff, error } = await supabase
      .from('staff')
      .select(`
        id,
        restaurant_id,
        name,
        phone,
        role,
        status,
        is_active,
        created_at,
        restaurants (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff data' },
        { status: 500 }
      )
    }

    // Process staff data for analytics
    const processedStaff = staff?.map(member => ({
      id: member.id,
      restaurantId: member.restaurant_id,
      restaurantName: member.restaurants?.name || 'Unknown Restaurant',
      name: member.name,
      phone: member.phone,
      role: member.role,
      status: member.status,
      isActive: member.is_active,
      createdAt: member.created_at
    })) || []

    // Calculate analytics metrics
    const totalStaff = processedStaff.length
    const activeStaff = processedStaff.filter(member => member.isActive).length
    const inactiveStaff = totalStaff - activeStaff

    // Group by restaurant
    const staffByRestaurant = processedStaff.reduce((acc, member) => {
      if (!acc[member.restaurantId]) {
        acc[member.restaurantId] = {
          restaurantId: member.restaurantId,
          restaurantName: member.restaurantName,
          totalStaff: 0,
          activeStaff: 0,
          inactiveStaff: 0,
          staff: []
        }
      }
      acc[member.restaurantId].totalStaff++
      if (member.isActive) {
        acc[member.restaurantId].activeStaff++
      } else {
        acc[member.restaurantId].inactiveStaff++
      }
      acc[member.restaurantId].staff.push(member)
      return acc
    }, {} as Record<string, any>)

    // Group by role
    const staffByRole = processedStaff.reduce((acc, member) => {
      const role = member.role || 'Other'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by status
    const staffByStatus = processedStaff.reduce((acc, member) => {
      const status = member.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentHires = processedStaff.filter(
      member => new Date(member.createdAt) > thirtyDaysAgo
    )

    return NextResponse.json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        inactiveStaff,
        staffByRestaurant: Object.values(staffByRestaurant),
        staffByRole,
        staffByStatus,
        recentHires,
        allStaff: processedStaff
      }
    })

  } catch (error) {
    console.error('Error in staff analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}