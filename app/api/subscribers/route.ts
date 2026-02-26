import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, deviceId, subscribedAt } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }

    // In a real app, you would save to a database
    // For now, we're relying on localStorage on the client side
    // This endpoint serves as a hook for future backend integration

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription added successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}
