import styled from 'styled-components';
import {
  Avatar,
  Card,
  Icon,
} from 'antd';

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  height: 100%;
  margin: 0;

  .ant-card-body {
    padding: 15px;
  }
`;

export const PriceContainer = styled.div`
  display: flex;
  font-size: 0.8rem;
  align-items: flex-end;
  justify-content: space-between;
`;

export const AvatarContainer = styled(Avatar)`
  background: none !important;
`;

export const LastPriceContainer = styled.div`
  font-weight: 400;
  font-size: 1.1rem;
`;

export const IconContainer = styled(Icon)`
  font-size: ${props => props.size || '16px'}
`;

export const LinkContainer = styled.a``;

export const ChangeContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 1rem;
`;
