import React from "react";
import { ThemeContext } from "styled-components";

import { CurrencyAmount } from "@archerswap/sdk";
import { useToggleSettingsMenu } from "state/application/hooks";
import {
  useUserTipManualOverride,
  useUserETHTip
} from "state/user/hooks";

import { RowBetween } from "components/Row";
import { ClickableText } from "pages/Pool/styleds";

import Slider from 'rc-slider';
import useFetchMinerTips from '../hooks/useFetchMinerTips.hook';
import useFetchEstimateGas from '../hooks/useFetchEstimateGas.hook';
import { useDerivedSwapInfo } from 'state/swap/hooks';

import 'rc-slider/assets/index.css';
import '../styles/slider.styles.css';

interface SwapInfo {
  from: string | null,
  to: string | null,
  value: string | null
};


const styles = {
  slider: {
    margin: '.8rem 1rem 2rem 1rem'
  },
  text: {
    fontWeight: 500,
    fontSize: 14,
  }
};

const getMarkLabel = (index: number, length: number) : string => {
  switch(index) {
    case 0:
      return 'Cheap';
    case length - 1:
        return 'Fast';
    case Math.floor(length/2):
      return 'Balanced';
    default:
      return ''
  }
}

const getMarksFromTips = (tips: Record<string, string>) => {
  const length = Object.values(tips).length;
  return Object.values(tips)
    .sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1))
    .reduce(
      (acc, price, index) => ({
        ...acc,
        [index]: { label: getMarkLabel(index, length), price },
      }),
      {}
    );
};

export default function SwapMinerTip() {

  const [swapInfo] = React.useState<SwapInfo>({ from: null, to: null, value: '0x100000000' });
  const [estimatedGas] = useFetchEstimateGas(swapInfo);

  const info = useDerivedSwapInfo();

  console.log("swapinfo", info);
 
  React.useEffect(() => {
    // setSwapInfo({
    //   from: null,
    //   to: null,
    //   value: '0x100000000'
    // })
  }, [info]);

  
  const theme = React.useContext(ThemeContext);
  const textStyles = {
    ...styles.text,
    color: theme.text2
  };

  const toggleSettings = useToggleSettingsMenu();
  const [userTipManualOverride] = useUserTipManualOverride();
  const [userETHTip] = useUserETHTip();
  const [tips] = useFetchMinerTips(userTipManualOverride);
  const [value, setValue] = React.useState<number>(0);

  const marks: Record<number, {label: string, price: string}>= React.useMemo(() => getMarksFromTips(tips), [tips]);
  
  const handleChange = React.useCallback(
    (newValue: number) => {
      setValue(newValue);
    },
    [setValue]
  );

  React.useEffect(() => {
    setValue(Math.floor(Object.values(marks).length / 2));
  }, [marks]);

  const max = Object.values(marks).length - 1;
  const isSliderVisible = !userTipManualOverride && max >= 0;
  const ethTip = isSliderVisible ? BigInt(marks[value].price) * BigInt(estimatedGas) : userETHTip;

  return (
    <>
      <RowBetween align="center">
        <ClickableText {...textStyles} onClick={toggleSettings}>
          Miner Tip
        </ClickableText>
        <ClickableText {...textStyles} onClick={toggleSettings}>
          {CurrencyAmount.ether(ethTip).toExact()} ETH
        </ClickableText>
      </RowBetween>
      {isSliderVisible && (
        <section style={styles.slider}>
          <Slider
            defaultValue={0}
            marks={marks}
            max={max}
            onChange={handleChange}
            value={value}
            step={null}
          />
        </section>
      )}
    </>
  );
}
