import { NextResponse } from 'next/server';

import { registerUser } from '@/services/UserService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await registerUser(body);

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        message: error.type || 'Failed to register user',
        details: error.message 
      },
      { status: error.statusCode || 500 }
    );
  }
}