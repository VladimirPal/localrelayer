// @flow
import React, {
  useState,
} from 'react';
import {
  Icon,
  Tooltip,
  Switch,
  Button,
  Input,
  Form,
} from 'antd';
import {
  Formik,
} from 'formik';
import type {
  Node,
} from 'react';
import type {
  Asset,
} from 'instex-core';
import Measure from 'react-measure';
import * as S from './styled';

type Props = {
  assets: Array<Asset>,
  balance: String,
  onToggleTradable: Function,
  onWithdraw: Function,
  onDeposit: Function,
  isTradingPage: boolean,
}

// use +n !== 0 because empty string (or spaced string) converts to 0
const isNumber = n => !isNaN(+n) && +n !== 0 && isFinite(n) && Math.abs(n) === +n; /* eslint-disable-line */
const getColumns = (
  onToggleTradable,
  isTradingPage,
) => [
  {
    title: 'Token',
    dataIndex: 'symbol',
    render: (text, record) => (
      <div>
        <Tooltip title={record.name}>
          {text}
        </Tooltip>
        {
          record.symbol === 'WETH'
            && (
              <Tooltip
                placement="bottom"
                title={(
                  <div>
                    Wrapping ETH allows you to trade directly with alt tokens
                  </div>
                )}
              >
                <Icon
                  style={{
                    marginLeft: 5,
                  }}
                  type="question-circle-o"
                />
              </Tooltip>
            )
        }
      </div>
    ),
    ...(!isTradingPage
      ? {
        defaultSortOrder: 'ascend',
        sorter: (a, b) => (a.symbol >= b.symbol ? 1 : -1),
      }
      : {}
    ),
  },
  ...(
    !isTradingPage ? [{
      title: 'Name',
      dataIndex: 'name',
      render: text => (
        <div>
          <Tooltip title={text}>
            {text}
          </Tooltip>
        </div>
      ),
      sorter: (a, b) => (a.name >= b.name ? 1 : -1),
    }] : []
  ),
  {
    title: 'Available Balance',
    dataIndex: 'availableBalance',
    render: (text, record) => (
      <div>
        {(
          record.isBalancePending
            && (
              <Icon type="loading" />
            )
        )}
        {text?.slice(0, 16)}
        <Tooltip
          placement="bottom"
          title={(
            <div>
              <div>
                <div>
                  Wallet balance:
                </div>
                {record.totalBalance}
              </div>
              <div>
                <div>
                  In orders:
                </div>
                {(record.totalBalance - record.availableBalance).toFixed(8)}
              </div>
            </div>
          )}
        >
          <Icon
            style={{
              marginLeft: 5,
            }}
            type="info-circle-o"
          />
        </Tooltip>
      </div>
    ),
    ...(!isTradingPage
      ? {
        sorter: (a, b) => a.balance - b.balance,
      }
      : {}
    ),
  },
  {
    title: 'Tradable',
    key: 'tradable',
    render: (text, record) => (
      record.isTradablePending
        ? (
          <Icon type="loading" />
        ) : (
          <Switch
            checked={record.isTradable}
            checkedChildren={(
              <Icon type="check" />
            )}
            onChange={(checked) => {
              onToggleTradable(checked, record);
            }}
          />
        )
    ),
  },
  ...(
    !isTradingPage ? [{
      key: 'wallet_watchAsset',
      render: (text, record) => (
        <Icon
          type="wallet"
          onClick={() => {
            window.web3.currentProvider.sendAsync({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  ...record,
                },
              },
              id: Math.round(Math.random() * 100000),
            });
          }}
        />
      ),
    }] : []
  ),
];

const UserBalance = ({
  isTradingPage,
  assets,
  onToggleTradable,
  balance,
  onDeposit,
  onWithdraw,
}: Props): Node => {
  const [searchText, setSearchText] = useState('');
  const [dimensions, setDimensions] = useState('');
  const s = searchText.toLowerCase();
  return (
    <Measure
      bounds
      onResize={(contentRect) => {
        setDimensions(contentRect.bounds);
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} style={{ height: '100%' }}>
          <S.UserBalance>
            <S.Title>
              <div>
                Balance
                {' '}
                {balance}
                {' '}
                ETH
              </div>
            </S.Title>
            <Formik
              isInitialValid
              validate={(values) => {
                const errors = {};
                if (values.amount.length && !isNumber(values.amount)) {
                  errors.amount = 'Amount should be a number';
                }
                return errors;
              }}
            >
              {({
                handleChange,
                values,
                resetForm,
                errors,
                isValid,
              }) => (
                <S.WrappingBar>
                  <S.Amount>
                    <Form.Item
                      validateStatus={errors.amount && 'error'}
                      help={errors.amount}
                    >
                      <Input
                        value={values.amount}
                        name="amount"
                        addonAfter={<div>ETH</div>}
                        placeholder="Amount"
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </Form.Item>
                  </S.Amount>
                  <S.UnwrapWrapBar>
                    <Button.Group>
                      <S.UnwrapButton
                        type="primary"
                        disabled={
                          !isValid
                          || !values?.amount?.length
                        }
                        onClick={() => {
                          onWithdraw(values.amount, { resetForm });
                        }}
                      >
                        Withdraw
                      </S.UnwrapButton>
                      <S.WrapButton
                        type="primary"
                        disabled={
                          !isValid
                          || !values?.amount?.length
                        }
                        onClick={() => {
                          onDeposit(values.amount, { resetForm });
                        }}
                      >
                        Deposit
                      </S.WrapButton>
                    </Button.Group>
                  </S.UnwrapWrapBar>
                  {!isTradingPage && (
                  <S.SearchField>
                    <Input
                      value={searchText}
                      onChange={ev => setSearchText(ev.target.value)}
                      placeholder="Search token name or symbol"
                    />
                  </S.SearchField>
                  )}
                </S.WrappingBar>
              )}
            </Formik>
            <S.Table
              isTradingPage={isTradingPage}
              pagination={false}
              scroll={
                isTradingPage
                  ? { y: dimensions.height }
                  : { y: dimensions.height - 150 }
              }
              rowKey="address"
              dataSource={(
                assets.filter(asset => (
                  searchText.length
                    ? (
                      asset.name.toLowerCase().includes(s)
                      || asset.symbol.toLowerCase().includes(s)
                    )
                    : true
                ))
              )}
              columns={getColumns(
                onToggleTradable,
                isTradingPage,
              )}
            />
          </S.UserBalance>
        </div>
      )}
    </Measure>
  );
};

export default UserBalance;
