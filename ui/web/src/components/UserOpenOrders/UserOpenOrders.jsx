// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
  Button,
} from 'antd';

import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import * as colors from 'web-styles/colors';
import * as S from './styled';


type Props = {
  orders: Array<any>,
  onOrderActionClick: Function,
}

const getColumns = onOrderActionClick => [{
  title: 'Pair',
  dataIndex: 'pair',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Created',
  dataIndex: 'metaData.createdAt',
  render: (text: string) => (
    <Tooltip title={new Date(text).toLocaleString()}>
      {new Date(text).toLocaleString()}
    </Tooltip>
  ),
}, {
  title: 'Price',
  dataIndex: 'price',
  render: (
    text: string,
    record: any,
  ) => (
    <Tooltip title={text}>
      <ColoredSpan
        color={(
          record.action === 'Sell'
            ? colors.red
            : colors.green
        )}
      >
        {text}
      </ColoredSpan>
    </Tooltip>
  ),
}, {
  title: 'Amount',
  dataIndex: 'amount',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Total',
  dataIndex: 'total',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Status',
  key: 'status',
  render: (text, record) => (
    record.metaData.isShadowed
      ? (
        <Tooltip title="This order is shadowed, read docs for more info">
          Unpublished
          <Icon
            style={{
              marginLeft: 5,
            }}
            type="info-circle-o"
          />
        </Tooltip>
      ) : (
        <Tooltip title="Published">
          Published
        </Tooltip>
      )
  ),
}, {
  title: 'Action',
  render: order => (
    <Button
      ghost
      size="small"
      onClick={() => {
        onOrderActionClick(order);
      }}
    >
      Cancel
    </Button>
  ),
}];

const UserOpenOrders = ({
  orders,
  onOrderActionClick,
}: Props) => (
  <S.UserOpenOrders>
    <S.Title>
      <div>
      Your open orders
      </div>
    </S.Title>
    <S.UserOpenOrdersTable
      size="small"
      rowKey="id"
      onRow={record => ({
        ...(
          record.metaData.isShadowed
            ? {
              className: 'shadowed',
            } : {}
        ),
      })}
      columns={getColumns(onOrderActionClick)}
      dataSource={orders}
      pagination={false}
      scroll={{ y: 340 }}
    />
  </S.UserOpenOrders>
);

export default UserOpenOrders;
