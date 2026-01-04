import { NextRequest, NextResponse } from 'next/server';

const DAILY_GM_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xe449f79ec594e609abc5fe170d678ae758e8efd7';
const GM_SENT_EVENT_SIGNATURE = '0xf62776e55315cfefc3f5fe84685591b4eb5f568199fbd8df4f308e36a9aa5dac';

// Use mainnet or sepolia Blockscout based on chain ID
const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === '8453';
const BLOCKSCOUT_API_URL = isMainnet
  ? 'https://base.blockscout.com/api'
  : 'https://base-sepolia.blockscout.com/api';

// Deployment blocks for each network
const CONTRACT_DEPLOYMENT_BLOCK = isMainnet ? 0 : 18000000;

export async function GET(request: NextRequest) {
  // Get address from query params
  const address = request.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter required' },
      { status: 400 }
    );
  }

  // Validate address format
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json(
      { error: 'Invalid address format' },
      { status: 400 }
    );
  }

  try {
    // Pad address to 32 bytes for topic filtering
    const paddedAddress = `0x000000000000000000000000${address.slice(2).toLowerCase()}`;

    // Build Blockscout API query
    const params = new URLSearchParams({
      module: 'logs',
      action: 'getLogs',
      address: DAILY_GM_ADDRESS,
      topic0: GM_SENT_EVENT_SIGNATURE,
      topic2: paddedAddress, // recipient (topic index 2 for indexed recipient parameter)
      topic0_2_opr: 'and', // operator between topic0 and topic2 (both must match)
      fromBlock: CONTRACT_DEPLOYMENT_BLOCK.toString(),
      toBlock: 'latest'
    });

    const response = await fetch(`${BLOCKSCOUT_API_URL}?${params.toString()}`);

    if (!response.ok) {
      console.error('Blockscout API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch events from Blockscout' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Blockscout returns { status, message, result }
    if (data.status !== '1') {
      console.error('Blockscout error:', data.message);
      // If message is "No records found", it means 0 GMs received (not an error)
      if (data.message === 'No records found') {
        return NextResponse.json({
          count: 0,
          success: true
        });
      }
      return NextResponse.json(
        { error: data.message || 'Failed to fetch events' },
        { status: 500 }
      );
    }

    const logs = data.result || [];

    return NextResponse.json({
      count: logs.length,
      success: true
    });

  } catch (error) {
    console.error('Error fetching GMs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cache response for 60 seconds to reduce API calls
export const revalidate = 60;
