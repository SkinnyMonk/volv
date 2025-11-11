import { NextResponse } from 'next/server';

export async function GET() {
  try {
    interface Order {
      id: string;
      symbol: string;
      type: 'BUY' | 'SELL';
      qty: number;
      price: number;
      status: 'FILLED' | 'PENDING' | 'CANCELLED';
      time: string;
    }

    const orders: Order[] = [
      {
        id: 'ORD001',
        symbol: 'TCS',
        type: 'BUY',
        qty: 50,
        price: 3745.25,
        status: 'FILLED',
        time: '09:30',
      },
      {
        id: 'ORD002',
        symbol: 'INFY',
        type: 'SELL',
        qty: 25,
        price: 2890.5,
        status: 'PENDING',
        time: '10:15',
      },
      {
        id: 'ORD003',
        symbol: 'RELIANCE',
        type: 'BUY',
        qty: 30,
        price: 2925.0,
        status: 'FILLED',
        time: '10:45',
      },
      {
        id: 'ORD004',
        symbol: 'HDFC',
        type: 'BUY',
        qty: 15,
        price: 2415.0,
        status: 'CANCELLED',
        time: '11:20',
      },
      {
        id: 'ORD005',
        symbol: 'SBIN',
        type: 'SELL',
        qty: 40,
        price: 680.0,
        status: 'PENDING',
        time: '11:55',
      },
    ];

    return NextResponse.json({
      success: true,
      widget: 'orders',
      data: orders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating orders data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate orders data' },
      { status: 500 }
    );
  }
}
