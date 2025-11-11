import hydraTopicConfig from './hydra-topic-config.json';

// Helper function to get auth credentials from Zustand store
function getAuthCredentials() {
  if (typeof window === 'undefined') {
    return { loginId: '', token: '' };
  }
  
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      const authState = authData.state;
      return {
        loginId: authState?.loginId || '',
        token: authState?.authToken || ''
      };
    }
  } catch (error) {
    console.error('Error parsing auth storage:', error);
  }
  
  return { loginId: '', token: '' };
}


export const modeStringToModeCode =
  Object.entries(hydraTopicConfig)
    .reduce((acc, [, { mode, code }]) => {
      return { ...acc, [mode]: code };
    }, {});


export const modeCodeToModeString =
  Object.entries(modeStringToModeCode)
    .reduce((acc, [modeString, modeCode]) => {
      return { ...acc, [modeCode]: modeString };
    }, {});


export function getSubscriptionTopic({ messageType, payload = {} }) {
  if (!(messageType in hydraTopicConfig)) {
    throw `${messageType} not supported`;
  }

  const privateMessageTypes = ['ClientAlerts', 'OrderUpdate', 'TradeUpdate', 'AdminMessage', 'PositionUpdate','FundsUpdate'];
  if (privateMessageTypes.includes(messageType)) {
    return `${messageType}`;
  }

  // const { mode, code } = hydraTopicConfig[messageType];
  const instrumentUpdates = ['DetailMarketDataMessage', 'CompactMarketDataMessage', "AuctionMarketDataMessage", 'SnapquoteDataMessage', 'TbtSnapquoteDataMessage', 'SpreadMarketUpdate', 'TbtUpdate', 'GreekData', 'MarkupMarketData'];
  if (instrumentUpdates.includes(messageType)) {
    const { exchangeCode, instrumentToken } = payload;
    if (!exchangeCode || !instrumentToken) {
      // throw `missing exchangeCode: ${exchangeCode} or instrumentToken: ${instrumentToken}`;
    }
    return `${messageType}/${exchangeCode}/${instrumentToken}`;
  }

  const exchangeUpdates = ['MktStatus', 'ExchangeMessage'];
  if (exchangeUpdates.includes(messageType)) {
    const { exchangeCode } = payload;
    if (!exchangeCode) {
      throw `missing exchangeCode: ${exchangeCode}`;
    }
    return `${messageType}/${exchangeCode}`;
  }

  throw `invalid messageType: ${messageType}`;
}

// supported actionType: subscribe, unsubscribe
export function getSocketPublishObject({ messageType, actionType, payload = {} }) {
  switch (messageType) {
    case 'SpreadMarketUpdate':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'spreaddata'
      };
    case 'DetailMarketDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'marketdata'
      };
    case 'AuctionMarketDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'auction_marketdata'
      };
    case 'CompactMarketDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'compact_marketdata'
      };
    case 'SnapquoteDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'full_snapquote'
      };
    case 'TbtSnapquoteDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'tbt_full_snapquote'
      };
    case 'OrderUpdate':
      return {
        a: actionType,
        v: [getAuthCredentials().loginId, "web"],
        m: 'updates'
      };
    case 'TradeUpdate':
      return {
        a: 'subscribe',
        v: [getAuthCredentials().loginId, "web"],
        m: 'updates'
      };
    case 'ExchangeMessage':
      return {
        a: actionType,
        v: [payload.exchangeCode],
        m: 'exchange_messages'
      };
    case 'PositionUpdate':
      return {
        a: 'subscribe',
        v: [getAuthCredentials().loginId, "web"],
        m: 'position_updates'
      };
    case 'FundsUpdate':
      return {
        a: 'subscribe',
        v: [getAuthCredentials().loginId, "web"],
        m: 'cash_updates'
      };
    case 'GreekData':
      return {
        a: 'subscribe',
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'greekdata'
      }
    case 'MarkupMarketData':
      return {
        a: 'subscribe',
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'markup_marketdata'
      }
    default:
      return {};
  }
}