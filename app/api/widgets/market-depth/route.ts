import { NextResponse } from 'next/server';

export async function GET() {
  try {
    interface DepthLevel {
      price: number;
      quantity: number;
      total: number;
    }

    const generateMockDepth = (): { bids: DepthLevel[]; asks: DepthLevel[] } => {
      const basePrice = 3745.25;
      const bids: DepthLevel[] = [];
      const asks: DepthLevel[] = [];

      for (let i = 1; i <= 8; i++) {
        const bidPrice = basePrice - i * 0.5;
        const askPrice = basePrice + i * 0.5;
        const quantity = Math.floor(Math.random() * 5000) + 1000;

        bids.push({
          price: bidPrice,
          quantity,
          total: bidPrice * quantity,
        });

        asks.push({
          price: askPrice,
          quantity: Math.floor(Math.random() * 5000) + 1000,
          total: askPrice * (Math.floor(Math.random() * 5000) + 1000),
        });
      }

      return { bids: bids.reverse(), asks };
    };

    const depthData = generateMockDepth();

    return NextResponse.json({
      success: true,
      widget: 'market-depth',
      data: depthData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating market depth data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate market depth data' },
      { status: 500 }
    );
  }
}
