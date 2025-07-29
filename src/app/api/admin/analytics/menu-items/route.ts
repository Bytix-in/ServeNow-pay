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

    // Get menu items data from database
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        restaurant_id,
        name,
        price,
        description,
        dish_type,
        tags,
        created_at,
        restaurants (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching menu items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch menu items data' },
        { status: 500 }
      )
    }

    // Process menu items data for analytics
    const processedMenuItems = menuItems?.map(item => ({
      id: item.id,
      restaurantId: item.restaurant_id,
      restaurantName: item.restaurants?.name || 'Unknown Restaurant',
      name: item.name,
      price: item.price,
      description: item.description,
      dishType: item.dish_type,
      tags: item.tags,
      createdAt: item.created_at
    })) || []

    // Calculate analytics metrics
    const totalMenuItems = processedMenuItems.length
    const averagePrice = totalMenuItems > 0 
      ? processedMenuItems.reduce((sum, item) => sum + item.price, 0) / totalMenuItems 
      : 0

    // Group by restaurant
    const menuItemsByRestaurant = processedMenuItems.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          totalItems: 0,
          averagePrice: 0,
          items: []
        }
      }
      acc[item.restaurantId].totalItems++
      acc[item.restaurantId].items.push(item)
      return acc
    }, {} as Record<string, any>)

    // Calculate average price per restaurant
    Object.values(menuItemsByRestaurant).forEach((restaurant: any) => {
      restaurant.averagePrice = restaurant.items.reduce((sum: number, item: any) => sum + item.price, 0) / restaurant.totalItems
    })

    // Group by dish type
    const itemsByDishType = processedMenuItems.reduce((acc, item) => {
      const dishType = item.dishType || 'Other'
      acc[dishType] = (acc[dishType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Price ranges
    const priceRanges = {
      'Under $10': processedMenuItems.filter(item => item.price < 10).length,
      '$10 - $20': processedMenuItems.filter(item => item.price >= 10 && item.price < 20).length,
      '$20 - $30': processedMenuItems.filter(item => item.price >= 20 && item.price < 30).length,
      'Over $30': processedMenuItems.filter(item => item.price >= 30).length
    }

    // Most expensive items
    const mostExpensiveItems = processedMenuItems
      .sort((a, b) => b.price - a.price)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        totalMenuItems,
        averagePrice,
        menuItemsByRestaurant: Object.values(menuItemsByRestaurant),
        itemsByDishType,
        priceRanges,
        mostExpensiveItems,
        allMenuItems: processedMenuItems
      }
    })

  } catch (error) {
    console.error('Error in menu items analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}