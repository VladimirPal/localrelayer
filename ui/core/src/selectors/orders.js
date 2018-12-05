// @flow
import {
  BigNumber,
} from '0x.js';
import {
  createSelector,
} from 'reselect';

import {
  getResourceMap,
  getResourceMappedList,
} from './resources';
import {
  toUnitAmount,
  getOrderPrice,
  getOrderType,
} from '../utils';


export const getTradingHistory = createSelector(
  [
    getResourceMappedList('orders', 'tradingHistory'),
    getResourceMap('assets'),
    getResourceMap('assetPairs'),
  ],
  (
    orders,
    assets,
    assetPairs,
  ) => orders.map((order) => {
    const assetPair = (
      assetPairs[`${order.makerAssetData}_${order.takerAssetData}`]
      || assetPairs[`${order.takerAssetData}_${order.makerAssetData}`]
    );
    if (!assetPair) {
      return false;
    }
    const orderType = getOrderType(
      assetPair.id.split('_')[0],
      order.makerAssetData,
    );

    const filledMakerAssetAmount = new BigNumber(order.makerAssetAmount)
      .times(order.metaData.filledTakerAssetAmount)
      .div(order.takerAssetAmount)
      .toFixed(8);

    const amount = orderType === 'bid'
      ? toUnitAmount(
        order.metaData.filledTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8)
      : toUnitAmount(
        filledMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8);

    const total = orderType === 'bid'
      ? toUnitAmount(
        filledMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8)
      : toUnitAmount(
        order.metaData.filledTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8);

    return {
      ...order,
      pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
      status: order.metaData.completedAt ? 'Completed' : 'Canceled',
      amount,
      total,
      price: getOrderPrice(
        orderType,
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
      key: order.id,
      completedAt: order.metaData.completedAt,
      lastFilledAt: order.metaData.lastFilledAt,
      type: orderType,
    };
  }).filter(Boolean),
);

export const getBidOrders = createSelector(
  [
    getResourceMappedList('orders', 'bids'),
    getResourceMap('assets'),
  ],
  (
    orders,
    assets,
  ) => (
    orders.filter(o => o.metaData.isValid).map(order => ({
      ...order,
      amount: toUnitAmount(
        order.metaData.remainingFillableTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      total: toUnitAmount(
        order.metaData.remainingFillableMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      price: getOrderPrice(
        'bid',
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
    }))
  ),
);

export const getAskOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.filter(o => o.metaData.isValid).map(order => ({
      ...order,
      amount: toUnitAmount(
        order.metaData.remainingFillableMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: toUnitAmount(
        order.metaData.remainingFillableTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: getOrderPrice(
        'ask',
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
    }))
  ),
);

export const getOpenOrders = createSelector(
  [
    getResourceMappedList('orders', 'userOrders'),
    getResourceMap('assets'),
    getResourceMap('assetPairs'),
  ],
  (
    orders,
    assets,
    assetPairs,
  ) => (
    orders.map((order) => {
      const assetPair = (
        assetPairs[`${order.makerAssetData}_${order.takerAssetData}`]
        || assetPairs[`${order.takerAssetData}_${order.makerAssetData}`]
      );
      if (!assetPair) {
        return false;
      }
      const orderType = getOrderType(
        assetPair.id.split('_')[0],
        order.makerAssetData,
      );

      const amount = orderType === 'bid'
        ? toUnitAmount(
          order.metaData.remainingFillableTakerAssetAmount,
          assets[order.takerAssetData].decimals,
        ).toFixed(8)
        : toUnitAmount(
          order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        ).toFixed(8);

      const total = orderType === 'bid'
        ? toUnitAmount(
          order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        ).toFixed(8)
        : toUnitAmount(
          order.metaData.remainingFillableTakerAssetAmount,
          assets[order.takerAssetData].decimals,
        ).toFixed(8);

      return ({
        ...order,
        pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
        amount,
        total,
        price: getOrderPrice(
          orderType,
          order.makerAssetAmount,
          order.takerAssetAmount,
        ).toFixed(8),
        action: (
          assetPair.id.split('_')[0] === order.makerAssetData
            ? 'Sell'
            : 'Buy'
        ),
      });
    })
  ),
);
