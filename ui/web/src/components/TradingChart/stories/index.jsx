import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import TradingChart from '..';

export const assetPair = {
  id: '0xe41d2489571d322189246dafa5ebde1f4699f498_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  assetDataA: {
    minAmount: '0',
    maxAmount: '10000000000000000000',
    precision: 5,
    assetData: {
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      name: '0x Protocol Token',
      symbol: 'ZRX',
      decimals: 18,
    },
  },
  assetDataB: {
    minAmount: '0',
    maxAmount: '50000000000000000000',
    precision: 5,
    assetData: {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
  },
  tradingInfo: {
    assetAVolume: '10001',
    change24: -50,
    lastPrice: '5',
    maxPrice: '10',
    minPrice: '5',
  },
};

const TradingChartStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tradingChart={(
      <TradingChart assetPair={assetPair} />
    )}
  />
);


storiesOf('Components|TradingChart', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [TradingChart],
    },
  })
  .add(
    'default',
    TradingChartStory,
    {
      info: {
        text: `
          TradingChart component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'full screen',
    TradingChartStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
