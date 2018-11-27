import styled from 'styled-components';
import {
  Card,
} from 'antd';


export const AssetPairCard = styled(Card)`
  height: 100%;
  margin: 0;

  .ant-card-body {
    padding: 15px;
  }
`;

export const AssetPairInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const CardTitle = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const AssetPrice = styled.div`
  display: flex;
  width: 100%;
  font-size: 0.75rem;
  line-height: 200%;
`;

export const BaseAssetAddress = styled.a`
  font-size: 0.8rem;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 10px;
`;

export const LastPrice = styled.div`
  font-weight: 400;
  font-size: 1.1rem;
`;

export const PriceChange = styled.div`
  font-size: 0.95rem;  
`;


export const HighLowBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 40%;
`;

export const ChangeVolumeBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 60%;
`;
