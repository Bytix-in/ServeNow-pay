import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { getDecryptedCredentials } from '@/lib/payment-utils'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Define interfaces for type safety
interface OrderData {
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  items: any[];
  total_amount: number;
  status: string;
  payment_status?: string;
  payment_error?: string;
  payment_gateway_order_id?: string;
  updated_at?: string;
}

interface CashfreeOrder {
  order_id: string;
  payment_session_id: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurant_id,
      customer_name,
      customer_phone,
      table_number,
      items,
      total_amount
    } = body

    console.log('Create payment request:', { restaurant_id, customer_name, total_amount })

    if (!restaurant_id || !customer_name || !customer_phone || !table_number || !items || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get restaurant's payment credentials
    let credentials
    try {
      credentials = await getDecryptedCredentials(restaurant_id)
      console.log('Credentials check result:', credentials ? 'Found' : 'Not found')
    } catch (credError) {
      console.error('Error getting credentials:', credError)
      credentials = null
    }

    if (!credentials) {
      console.log('No payment credentials found for restaurant:', restaurant_id)

      // Check if restaurant exists and is active
      const { data: restaurantCheck, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('id, name, status')
        .eq('id', restaurant_id)
        .single()

      if (restaurantError || !restaurantCheck) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        )
      }

      if (restaurantCheck.status !== 'active') {
        return NextResponse.json(
          { error: 'Restaurant is currently not accepting orders' },
          { status: 400 }
        )
      }

      // Create order without payment processing
      try {
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert([{
            restaurant_id,
            customer_name,
            customer_phone,
            table_number,
            items,
            total_amount,
            status: 'pending',
            payment_status: 'not_configured'
          }])
          .select()
          .single()

        if (orderError) {
          console.error('Order creation error:', orderError)
          throw new Error(`Failed to create order: ${orderError.message}`)
        }

        console.log('Order created without payment processing:', order.id)

        return NextResponse.json({
          success: true,
          order_id: order.id,
          message: 'Order placed successfully! The restaurant will process payment manually.',
          redirect_url: `/payment/success?order_id=${order.id}&no_payment=true`,
          payment_configured: false
        })
      } catch (fallbackError: any) {
        console.error('Order creation failed:', fallbackError)
        return NextResponse.json(
          { error: `Failed to create order: ${fallbackError?.message || 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    // Create order in database first
    const orderData: OrderData = {
      restaurant_id,
      customer_name,
      customer_phone,
      table_number,
      items,
      total_amount,
      status: 'pending'
    }

    // Try to add payment status if column exists
    try {
      orderData.payment_status = 'pending'
    } catch (e) {
      console.log('Payment status column might not exist')
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    console.log('Order created:', order.id)

    // Create Cashfree order directly (no separate auth needed)
    const baseUrl = credentials.environment === 'production'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com'

    console.log('Creating Cashfree order...')
    console.log('Using environment:', credentials.environment)
    console.log('Using base URL:', baseUrl)
    console.log('Base URL:', baseUrl)
    console.log('Client ID:', credentials.client_id)
    console.log('Environment:', credentials.environment)

    // Create Cashfree order with more standardized format
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // For production mode, ensure HTTPS is used (required by Cashfree production)
    if (credentials.environment === 'production') {
      // If we're using localhost in development but testing production mode
      if (appUrl.startsWith('http://localhost')) {
        // Use a dummy HTTPS URL for testing production mode locally
        appUrl = 'https://example.com';
      } else if (appUrl.startsWith('http://')) {
        // Convert any other HTTP URL to HTTPS
        appUrl = appUrl.replace('http://', 'https://');
      }
    }

    console.log('Using app URL for return/notify:', appUrl);

    // Format order ID to ensure it meets Cashfree requirements
    // Cashfree requires alphanumeric order IDs with max 50 characters
    const timestamp = Date.now().toString().slice(-10); // Use last 10 digits of timestamp
    const shortOrderId = order.id.replace(/-/g, '').slice(0, 20); // Use first 20 chars of UUID without dashes
    const cashfreeOrderId = `ord_${timestamp}_${shortOrderId}`; // This will be under 50 chars

    const orderPayload = {
      order_id: cashfreeOrderId,
      order_amount: total_amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer_name,
        customer_email: `${customer_phone.replace(/[^0-9]/g, '')}@servenow.app`, // Clean phone number
        customer_phone: customer_phone.replace(/[^0-9]/g, '') // Ensure phone is numeric only
      },
      order_meta: {
        return_url: `https://serrve-testing.vercel.app/payment/success?order_id=${order.id}`,
        notify_url: `https://serrve-testing.vercel.app/api/payment-webhook`
      }
    }

    console.log('Order payload:', JSON.stringify(orderPayload, null, 2))

    // Validate credentials before making the API call
    if (!credentials.client_id || !credentials.client_secret) {
      console.error('Invalid credentials: Missing client ID or secret');

      // Update order with error information
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_error: JSON.stringify({ message: 'Invalid payment credentials' }),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      throw new Error('Invalid payment credentials: Missing client ID or secret');
    }

    // Add more detailed logging before making the API call
    console.log('Making Cashfree API request with:');
    console.log('- URL:', `${baseUrl}/pg/orders`);
    console.log('- Client ID length:', credentials.client_id.length);
    console.log('- Client Secret length:', credentials.client_secret.length);
    console.log('- Environment:', credentials.environment);

    // Make the API call
    let createOrderResponse;
    let cashfreeOrder: CashfreeOrder;

    try {
      createOrderResponse = await fetch(`${baseUrl}/pg/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': credentials.client_id,
          'x-client-secret': credentials.client_secret,
          'x-api-version': '2022-09-01' // Using a stable API version
        },
        body: JSON.stringify(orderPayload)
      });

      console.log('Cashfree order response status:', createOrderResponse.status);

      if (!createOrderResponse.ok) {
        let errorData;
        try {
          errorData = await createOrderResponse.json();
          console.error('Cashfree error response:', JSON.stringify(errorData, null, 2));
        } catch (e) {
          const textResponse = await createOrderResponse.text();
          console.error('Cashfree error response (text):', textResponse);
          errorData = { message: textResponse };
        }

        // Update order with error information
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            payment_error: JSON.stringify(errorData),
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        throw new Error(`Failed to create Cashfree order: ${JSON.stringify(errorData)}`);
      }

      // Parse the response
      cashfreeOrder = await createOrderResponse.json();
      console.log('Cashfree order created successfully:', cashfreeOrder.order_id);

    } catch (apiError: any) {
      console.error('API call error:', apiError);

      // Update order with error information
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_error: JSON.stringify({ message: apiError?.message || 'API call failed' }),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      throw apiError;
    }

    // Update order with Cashfree order ID
    await supabaseAdmin
      .from('orders')
      .update({
        payment_gateway_order_id: cashfreeOrder.order_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    // Create transaction record
    await supabaseAdmin
      .from('transactions')
      .insert([{
        restaurant_id,
        order_id: order.id,
        payment_gateway: 'cashfree',
        gateway_order_id: cashfreeOrder.order_id,
        amount: total_amount,
        currency: 'INR',
        status: 'pending',
        gateway_response: cashfreeOrder
      }])

    return NextResponse.json({
      success: true,
      order_id: order.id,
      payment_session_id: cashfreeOrder.payment_session_id,
      cashfree_order_id: cashfreeOrder.order_id,
      environment: credentials.environment
    })

  } catch (error: any) {
    console.error('Error creating payment:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error?.message || 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}