/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Created by nghinv on Fri Jul 23 2021
 * Copyright (c) 2021 nghinv@lumi.biz
 */

import React, { useCallback, useEffect } from 'react';
import equals from 'react-fast-compare';
import { colors, HsvAnimated, useHsv } from '@nghinv/react-native-animated';
import type Animated from 'react-native-reanimated';
import ColorPickerComponent from './ColorPickerComponent';

export interface ColorPickerProps {
  size?: number;
  strokeWidth?: number;
  initialColor?: string;
  disabled?: boolean;
  onColorChange?: (color: string) => void;
  onColorConfirm?: (color: string) => void;
  hsv?: HsvAnimated;
  isGestureActive?: Animated.SharedValue<boolean>;
  rectSizeSpace?: number;
  resetSaturationWhenHueChange?: boolean;
}

function ColorPicker(props: ColorPickerProps) {
  const {
    initialColor = '#ffffff',
    onColorChange,
    onColorConfirm,
    ...otherProps
  } = props;
  const hsv = props.hsv ?? useHsv(colors.hex2Hsv(initialColor));

  useEffect(() => {
    if (initialColor) {
      const hsvColor = colors.hex2Hsv(initialColor);
      hsv.h.value = hsvColor.h;
      hsv.s.value = hsvColor.s;
      hsv.v.value = hsvColor.v;
    }
  }, [initialColor, hsv]);

  const onWheelColorChange = useCallback((color) => {
    onColorChange?.(color);
  }, []);

  const onWheelColorConfirm = useCallback((color) => {
    onColorConfirm?.(color);
  }, []);

  return (
    <ColorPickerComponent
      {...otherProps}
      onColorChange={onWheelColorChange}
      onColorConfirm={onWheelColorConfirm}
      hsv={hsv}
    />
  );
}

export default React.memo(ColorPicker, equals);
