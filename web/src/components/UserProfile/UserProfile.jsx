// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import { Card, Avatar } from 'antd';

const { Meta } = Card;

type Props = {
  balance: string,
  address: string,
  network: string,
};

/**
 * User profile with address and balance
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const UserProfile: StatelessFunctionalComponent<Props> = ({
  address,
  balance,
  network,
}: Props): Node => (
  <Card style={{ width: 300 }}>
    <Meta
      avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
      title={address}
      description={
        <div>
          <div>Balance: {balance} ETH</div>
          <div>Network: {network}</div>
        </div>
      }
    />
  </Card>
);

export default UserProfile;
