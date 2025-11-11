import { NextResponse } from 'next/server';

export async function GET() {
  try {
    interface OptionChainData {
      strikePrice: number;
      callBid: number;
      callAsk: number;
      callVolume: number;
      callOpenInterest: number;
      putBid: number;
      putAsk: number;
      putVolume: number;
      putOpenInterest: number;
    }

    // Mock option chain data
    const basePrice = 3745.25;
    const optionChainData: OptionChainData[] = [];

    for (let i = 0; i < 15; i++) {
      const strikePrice = basePrice - 50 + i * 10;
      optionChainData.push({
        strikePrice,
        callBid: Math.max(0, basePrice - strikePrice + Math.random() * 10),
        callAsk: Math.max(0, basePrice - strikePrice + Math.random() * 10 + 5),
        callVolume: Math.floor(Math.random() * 10000) + 1000,
        callOpenInterest: Math.floor(Math.random() * 50000) + 10000,
        putBid: Math.max(0, strikePrice - basePrice + Math.random() * 10),
        putAsk: Math.max(0, strikePrice - basePrice + Math.random() * 10 + 5),
        putVolume: Math.floor(Math.random() * 10000) + 1000,
        putOpenInterest: Math.floor(Math.random() * 50000) + 10000,
      });
    }

    return NextResponse.json({
      success: true,
      widget: 'option-chain',
      data: optionChainData,
      basePrice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating option chain data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate option chain data' },
      { status: 500 }
    );
  }
}
