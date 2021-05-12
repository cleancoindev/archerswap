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
import useRCSlider from '../hooks/useRCSlider.hook';
import 'rc-slider/assets/index.css';

const styles = {
  slider: {
    margin: '.5rem 1rem 2rem 1rem'
  },
  text: {
    fontWeight: 500,
    fontSize: 14,
  }
};

export default function SwapMinerTip() {
  const theme = React.useContext(ThemeContext);
  const textStyles = {
    ...styles.text,
    color: theme.text2
  };

  const toggleSettings = useToggleSettingsMenu();
  const [userTipManualOverride] = useUserTipManualOverride();
  const [manualEthTip] = useUserETHTip();

  const [tips] = useFetchMinerTips(userTipManualOverride);
  const [{ marks, value, max }, handleChange] = useRCSlider(tips);

  const isSliderVisible = !userTipManualOverride && max > 0;
  const ethTip = isSliderVisible ? tips[marks[value]] : manualEthTip;

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
