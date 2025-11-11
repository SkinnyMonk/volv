import { NextResponse } from 'next/server';

export async function GET() {
  try {
    interface MarketWatch {
      token: string | number;
      name: string;
      ltp: number;
      change: number;
      changePercent: number;
      high: number;
      low: number;
      open: number;
      close: number;
      volume: number;
      oi?: number;
    }

    // Mock market watch data (would come from database in production)
    const mockMarketWatches: { [key: string]: MarketWatch[] } = {
      'watchlist-1': [
        {
          token: 3456,
          name: 'TCS',
          ltp: 3745.25,
          change: 45.25,
          changePercent: 1.22,
          high: 3800.00,
          low: 3700.00,
          open: 3750.00,
          close: 3700.00,
          volume: 125000,
        },
        {
          token: 2890,
          name: 'INFY',
          ltp: 2890.50,
          change: -15.75,
          changePercent: -0.54,
          high: 2920.00,
          low: 2880.00,
          open: 2906.25,
          close: 2906.25,
          volume: 95000,
        },
        {
          token: 2925,
          name: 'RELIANCE',
          ltp: 2925.00,
          change: 30.00,
          changePercent: 1.03,
          high: 2950.00,
          low: 2895.00,
          open: 2895.00,
          close: 2895.00,
          volume: 180000,
        },
      ],
      'watchlist-2': [
        {
          token: 2415,
          name: 'HDFC',
          ltp: 2415.00,
          change: -10.00,
          changePercent: -0.41,
          high: 2425.00,
          low: 2400.00,
          open: 2425.00,
          close: 2425.00,
          volume: 75000,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      widget: 'market-watch',
      data: mockMarketWatches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating market watch data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate market watch data' },
      { status: 500 }
    );
  }
}
