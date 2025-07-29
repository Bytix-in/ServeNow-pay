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

    // Get transactions data from database
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        restaurant_id,
        order_id,
        payment_gateway,
        amount,
        currency,
        status,
        created_at,
        updated_at,
        restaurants (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions data' },
        { status: 500 }
      )
    }

    // Process transactions data for analytics
    const processedTransactions = transactions?.map(transaction => ({
      id: transaction.id,
      restaurantId: transaction.restaurant_id,
      restaurantName: transaction.restaurants?.name || 'Unknown Restaurant',
      orderId: transaction.order_id,
      paymentGateway: transaction.payment_gateway,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    })) || []

    // Calculate analytics metrics
    const totalTransactions = processedTransactions.length
    const totalTransactionAmount = processedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    const successfulTransactions = processedTransactions.filter(t => t.status === 'success' || t.status === 'completed').length
    const failedTransactions = processedTransactions.filter(t => t.status === 'failed' || t.status === 'cancelled').length

    // Group by restaurant
    const transactionsByRestaurant = processedTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.restaurantId]) {
        acc[transaction.restaurantId] = {
          restaurantId: transaction.restaurantId,
          restaurantName: transaction.restaurantName,
          totalTransactions: 0,
          totalAmount: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          transactions: []
        }
      }
      acc[transaction.restaurantId].totalTransactions++
      acc[transaction.restaurantId].totalAmount += transaction.amount
      if (transaction.status === 'success' || transaction.status === 'completed') {
        acc[transaction.restaurantId].successfulTransactions++
      } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
        acc[transaction.restaurantId].failedTransactions++
      }
      acc[transaction.restaurantId].transactions.push(transaction)
      return acc
    }, {} as Record<string, any>)

    // Group by status
    const transactionsByStatus = processedTransactions.reduce((acc, transaction) => {
      acc[transaction.status] = (acc[transaction.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent transactions (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentTransactions = processedTransactions.filter(
      transaction => new Date(transaction.createdAt) > sevenDaysAgo
    )

    return NextResponse.json({
      success: true,
      data: {
        totalTransactions,
        totalTransactionAmount,
        successfulTransactions,
        failedTransactions,
        transactionsByRestaurant: Object.values(transactionsByRestaurant),
        transactionsByStatus,
        recentTransactions,
        allTransactions: processedTransactions
      }
    })

  } catch (error) {
    console.error('Error in transactions analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}