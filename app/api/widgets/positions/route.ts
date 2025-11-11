import { NextResponse } from 'next/server';

export async function GET() {
  try {
    interface Position {
      id: string;
      symbol: string;
      type: 'LONG' | 'SHORT';
      qty: number;
      avgPrice: number;
      currentPrice: number;
      pl: number;
      plPercent: number;
    }

    const positions: Position[] = [
      {
        id: 'POS001',
        symbol: 'TCS',
        type: 'LONG',
        qty: 50,
        avgPrice: 3700.0,
        currentPrice: 3745.25,
        pl: 2262.5,
        plPercent: 1.22,
      },
      {
        id: 'POS002',
        symbol: 'INFY',
        type: 'LONG',
        qty: 25,
        avgPrice: 2906.25,
        currentPrice: 2890.5,
        pl: -394.25,
        plPercent: -0.54,
      },
      {
        id: 'POS003',
        symbol: 'RELIANCE',
        type: 'LONG',
        qty: 30,
        avgPrice: 2895.0,
        currentPrice: 2925.0,
        pl: 900.0,
        plPercent: 1.03,
      },
      {
        id: 'POS004',
        symbol: 'HDFC',
        type: 'SHORT',
        qty: 15,
        avgPrice: 2425.0,
        currentPrice: 2415.0,
        pl: 150.0,
        plPercent: 0.41,
      },
    ];

    return NextResponse.json({
      success: true,
      widget: 'positions',
      data: positions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating positions data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate positions data' },
      { status: 500 }
    );
  }
}
