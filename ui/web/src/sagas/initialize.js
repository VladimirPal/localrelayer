// @flow
import {
  assetDataUtils,
  BigNumber,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import uuidv4 from 'uuid/v4';
import * as eff from 'redux-saga/effects';

import {
  eventChannel,
  channel,
} from 'redux-saga';
import {
  matchPath,
} from 'react-router';

import {
  coreSagas,
  coreActions,
  api,
} from 'instex-core';

import moment from 'moment';

import config from 'web-config';

import {
  actionTypes,
  uiActions,
} from 'web-actions';
import {
  getUiState,
} from 'web-selectors';
import {
  getHistory,
} from 'web-history';


function* subscribeOnUpdateOrders(): Saga<void> {
  const networkId = yield eff.select(getUiState('networkId'));
  // const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
  const requestId = uuidv4();

  yield eff.put(uiActions.setUiState({
    ordersSubscribeId: requestId,
  }));
  yield eff.put(coreActions.sendSocketMessage({
    type: 'subscribe',
    channel: 'orders',
    requestId,
    payload: {
      // makerAssetData: currentAssetPairId.split('_')[0],
      // takerAssetData: currentAssetPairId.split('_')[1],
      networkId,
    },
  }));
}

function* subscribeOnCurrentTradingInfo(): Saga<void> {
  const networkId = yield eff.select(getUiState('networkId'));
  const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
  const requestId = uuidv4();

  yield eff.put(uiActions.setUiState({
    tradingInfoSubscribeId: requestId,
  }));
  yield eff.put(coreActions.sendSocketMessage({
    type: 'subscribe',
    channel: 'tradingInfo',
    requestId,
    payload: {
      pairs: [{
        assetDataA: currentAssetPairId.split('_')[0],
        assetDataB: currentAssetPairId.split('_')[1],
        networkId,
      }],
    },
  }));
}

function* setCurrentPair({
  location,
  webRadioChannel,
  networkId,
}) {
  const match = matchPath(location.pathname, {
    path: '/:baseAsset-:quoteAsset',
    exact: true,
    strict: false,
  }) || {
    params: {
      baseAsset: 'ZRX',
      quoteAsset: 'WETH',
    },
  };
  if (
    match
    || location.pathname === '/'
  ) {
    try {
      const {
        assetPair,
        isListed,
      } = yield eff.call(coreSagas.checkAssetPair, {
        baseAsset: match.params.baseAsset,
        quoteAsset: match.params.quoteAsset,
        networkId,
      });
      const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
      const tradingInfoSubscribeId = yield eff.select(getUiState('tradingInfoSubscribeId'));
      const ordersSubscribeId = yield eff.select(getUiState('ordersSubscribeId'));

      yield eff.put(uiActions.setUiState({
        currentAssetPairId: assetPair.id,
        isCurrentPairListed: isListed,
        isCurrentPairIssue: false,
      }));

      /* Unsubscribe after pair change */
      if (currentAssetPairId && tradingInfoSubscribeId) {
        yield eff.put(coreActions.sendSocketMessage({
          type: 'unsubscribe',
          requestId: tradingInfoSubscribeId,
        }));
      }
      yield eff.fork(subscribeOnCurrentTradingInfo);

      /* Unsubscribe after pair change */
      if (currentAssetPairId && ordersSubscribeId) {
        yield eff.put(coreActions.sendSocketMessage({
          type: 'unsubscribe',
          requestId: ordersSubscribeId,
        }));
      }
      yield eff.fork(subscribeOnUpdateOrders);

      yield eff.fork(
        coreSagas.fetchTradingInfo,
        {
          pairs: [{
            networkId,
            assetDataA: assetPair.assetDataA.assetData,
            assetDataB: assetPair.assetDataB.assetData,
          }],
        },
      );
      yield eff.fork(
        coreSagas.fetchOrderBook,
        {
          networkId,
          baseAssetData: assetPair.assetDataA.assetData,
          quoteAssetData: assetPair.assetDataB.assetData,
        },
      );
      yield eff.fork(
        coreSagas.fetchTradingHistory,
        {
          networkId,
          baseAssetData: assetPair.assetDataA.assetData,
          quoteAssetData: assetPair.assetDataB.assetData,
        },
      );
      yield eff.put(
        webRadioChannel,
        {
          sagaName: 'setCurrentPair',
          message: {
            assetPair,
          },
        },
      );
    } catch (errors) {
      console.log(errors);
      yield eff.put(uiActions.setUiState({
        isCurrentPairIssue: true,
        currentPairErrors: errors,
      }));
    }
  }
}

function* subscribeChartOnOrderUpdate() {
  const { payload: { callback, assetPair } } = yield eff.take(
    coreActions.actionTypes.TRADING_CHART_INITIALIZE_SUBSCRIBE,
  );

  while (true) {
    const { payload: { order } } = yield eff.take(
      coreActions.actionTypes.TRADING_CHART_SUBSCRIBE_ON_ORDER_CREATE,
    );

    const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
    const [baseAssetData] = currentAssetPairId.split('_');

    const [
      price,
      amount,
    ] = (
      order.makerAssetData === baseAssetData
        ? [
          new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount),
          order.makerAssetAmount,
        ]
        : [
          new BigNumber(order.makerAssetAmount).div(order.takerAssetAmount),
          order.takerAssetAmount,
        ]
    );

    // Convert volume to normal unit amount
    const volume = +Web3Wrapper.toUnitAmount(
      new BigNumber(parseFloat(amount)),
      assetPair.assetDataB.assetData.decimals,
    );

    const bar = {
      volume,
      time: moment(order.completedAt).unix() * 1000,
      open: parseFloat(price),
      close: parseFloat(price),
      low: parseFloat(price),
      high: parseFloat(price),
    };

    // console.log('bar', bar);
    callback(bar);
  }
}

function* takeChangeRoute({
  historyChannel,
  webRadioChannel,
  networkId,
}) {
  while (true) {
    const { location } = yield eff.take(historyChannel);
    yield eff.fork(
      setCurrentPair,
      {
        location,
        webRadioChannel,
        networkId,
      },
    );
  }
}

function socketCloseChannel(socket) {
  return eventChannel((emit) => {
    socket.onclose = (data) => emit(data); /* eslint-disable-line */
    socket.onerror = (data) => emit(data); /* eslint-disable-line */
    return () => {};
  });
}

function* socketConnect(): Saga<void> {
  let isReconnect = false;
  let delay = 0;
  while (true) {
    const socket = yield eff.call(
      coreSagas.socketConnect,
      config.socketUrl,
    );
    if (socket.readyState === 1) {
      delay = 0;
      if (isReconnect) {
        yield eff.fork(subscribeOnCurrentTradingInfo);
        yield eff.fork(subscribeOnUpdateOrders);
      }
    }
    const onCloseChannel = socketCloseChannel(socket);
    const task = yield eff.fork(coreSagas.handleSocketIO, socket);
    yield eff.take(onCloseChannel);
    yield eff.cancel(task);
    yield eff.delay(delay);
    if (delay < 5000) {
      delay += 500;
    }
    isReconnect = true;
  }
}

export function* initialize(): Saga<void> {
  const { historyType } = yield eff.take(actionTypes.INITIALIZE_WEB_APP);
  api.setApiUrl(config.apiUrl);
  console.log('Web initialize saga');

  const networkId = yield eff.call(web3.eth.net.getId);
  yield eff.put(uiActions.setUiState({
    networkId,
  }));
  const webRadioChannel = yield eff.call(channel);
  const fetchPairsTask = yield eff.fork(
    coreSagas.fetchAssetPairs,
    {
      networkId,
    },
  );
  yield eff.fork(socketConnect);

  const history = getHistory(historyType);
  const historyChannel = eventChannel(
    emitter => (
      history.listen((location, action) => {
        emitter({
          location,
          action,
        });
      })
    ),
  );
  yield eff.fork(
    takeChangeRoute,
    {
      historyChannel,
      webRadioChannel,
      networkId,
    },
  );

  yield eff.fork(subscribeChartOnOrderUpdate);

  yield eff.put(uiActions.setUiState({
    isAppInitializing: false,
  }));
  yield eff.join(fetchPairsTask);
  yield eff.fork(
    setCurrentPair,
    {
      location: history.location,
      webRadioChannel,
      networkId,
    },
  );
  yield eff.fork(coreSagas.takeApproval);
  yield eff.fork(coreSagas.takeDepositAndWithdraw);

  let watchWalletTask;
  /* Web radio center */
  while (true) {
    const {
      sagaName,
      message,
    } = yield eff.take(webRadioChannel);

    switch (sagaName) {
      case 'setCurrentPair': {
        if (watchWalletTask) {
          yield eff.cancel(watchWalletTask);
        }
        const { tokenAddress: tokenA } = assetDataUtils.decodeAssetDataOrThrow(
          message.assetPair.assetDataA.assetData,
        );
        const { tokenAddress: tokenB } = assetDataUtils.decodeAssetDataOrThrow(
          message.assetPair.assetDataB.assetData,
        );
        watchWalletTask = yield eff.fork(
          coreSagas.watchWallet,
          {
            delay: 5000,
            tokens: [
              tokenA,
              tokenB,
            ],
          },
        );
        break;
      }
      default:
        break;
    }
  }
}
