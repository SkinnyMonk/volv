import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const generateMockChartData = () => {
      const data = [];
      let price = 3700;
      
      for (let i = 0; i < 50; i++) {
        const change = (Math.random() - 0.5) * 30;
        price += change;
        data.push({
          time: i.toString().padStart(2, '0'),
          open: price - Math.random() * 10,
          high: price + Math.random() * 15,
          low: price - Math.random() * 15,
          close: price,
          volume: Math.floor(Math.random() * 10000) + 5000,
        });
      }
      
      return data;
    };

    const chartData = generateMockChartData();

    return NextResponse.json({
      success: true,
      widget: 'chart',
      data: chartData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating chart data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate chart data' },
      { status: 500 }
    );
  }
}
