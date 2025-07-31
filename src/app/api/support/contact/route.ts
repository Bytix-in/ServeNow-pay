import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, message, userInfo } = await request.json()

    // Here you would typically:
    // 1. Save the support request to your database
    // 2. Send email notifications to support team
    // 3. Create a ticket in your support system
    // 4. Send confirmation email to the user

    console.log('Support request received:', {
      type,
      message,
      userInfo,
      timestamp: new Date().toISOString()
    })

    // Simulate different response times based on contact method
    const responseTime = type === 'chat' ? '< 5 minutes' : 
                        type === 'email' ? '< 24 hours' : 
                        'Call back within 2 hours'

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      ticketId: `TICKET-${Date.now()}`,
      expectedResponse: responseTime
    })

  } catch (error) {
    console.error('Error processing support request:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit support request' },
      { status: 500 }
    )
  }
}