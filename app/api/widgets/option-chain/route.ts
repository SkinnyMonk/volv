import { NextResponse } from 'next/server';

interface OptionChainRow {
  strike: number;
  callBid: number;
  callAsk: number;
  callVolume: number;
  callOpenInterest: number;
  putBid: number;
  putAsk: number;
  putVolume: number;
  putOpenInterest: number;
}

/**
 * Generate mock option chain data for development/fallback
 * Uses realistic NIFTY 50 strike prices and option premiums
 */
function generateMockOptionChain(underlyingPrice: number): OptionChainRow[] {
  const data: OptionChainRow[] = [];
  const baseStrike = Math.round(underlyingPrice / 100) * 100;

  // Generate strikes from -10 to +10 (in 100-point increments for NIFTY 50)
  for (let i = -10; i <= 10; i++) {
    const strike = baseStrike + i * 100;
    const distance = Math.abs(i);

    // More realistic pricing: higher premiums for ATM, lower for OTM
    const callValue = Math.max(0, underlyingPrice - strike);
    const putValue = Math.max(0, strike - underlyingPrice);

    // Add time value (decreases as we move away from ATM)
    const timeValue = 50 * Math.exp(-distance / 5);

    data.push({
      strike,
      callBid: callValue + timeValue * 0.7 + Math.random() * 5,
      callAsk: callValue + timeValue * 0.8 + Math.random() * 5 + 5,
      callVolume: Math.floor(Math.random() * 20000) + 1000,
      callOpenInterest: Math.floor(Math.random() * 100000) + 10000,
      putBid: putValue + timeValue * 0.7 + Math.random() * 5,
      putAsk: putValue + timeValue * 0.8 + Math.random() * 5 + 5,
      putVolume: Math.floor(Math.random() * 20000) + 1000,
      putOpenInterest: Math.floor(Math.random() * 100000) + 10000,
    });
  }

  return data.sort((a, b) => a.strike - b.strike);
}

export async function GET() {
  try {
    // NIFTY 50 parameters
    const UNDERLYING_PRICE = 24500; // Current/mock Nifty 50 price
    const EXCHANGE = 'NSE';
    const EXCHANGE_CODE = 1;
    const INSTRUMENT_TOKEN = 26000;

    // Generate option chain data
    const optionChainData = generateMockOptionChain(UNDERLYING_PRICE);

    return NextResponse.json(
      {
        success: true,
        widget: 'option-chain',
        underlying: {
          symbol: 'NIFTY 50',
          exchange: EXCHANGE,
          exchangeCode: EXCHANGE_CODE,
          token: INSTRUMENT_TOKEN,
          price: UNDERLYING_PRICE,
        },
        data: optionChainData,
        metadata: {
          strikeCount: optionChainData.length,
          baseStrike: Math.round(UNDERLYING_PRICE / 100) * 100,
          minStrike: Math.min(...optionChainData.map((d) => d.strike)),
          maxStrike: Math.max(...optionChainData.map((d) => d.strike)),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[option-chain] Error generating option chain data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate option chain data' },
      { status: 500 }
    );
  }
}
