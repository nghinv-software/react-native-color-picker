/**
 * Created by nghinv on Fri Jul 23 2021
 * Copyright (c) 2021 nghinv@lumi.biz
 */

import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import equals from 'react-fast-compare';
import Svg, { Defs } from 'react-native-svg';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, useAnimatedReaction, withTiming } from 'react-native-reanimated';
import { canvas2Polar, vec, polar2Canvas, useVector, toRadian, colors, toDeg, timingConfig, HsvAnimated } from '@nghinv/react-native-animated';
import CircleLineGradient from './components/CircleLineGradient';
import SaturationPicker from './components/SaturationPicker';
import MaskView from './components/MaskView';

interface ColorPickerComponentProps {
  size?: number;
  strokeWidth?: number;
  disabled?: boolean;
  onColorChange: (color: string) => void;
  onColorConfirm: (color: string) => void;
  hsv: HsvAnimated;
  isGestureActive?: Animated.SharedValue<boolean>;
  resetSaturationWhenHueChange?: boolean;
  rectSizeSpace?: number;
}

function ColorPickerComponent(props: ColorPickerComponentProps) {
  const {
    strokeWidth = 36,
    hsv,
    onColorChange,
    onColorConfirm,
    resetSaturationWhenHueChange,
    rectSizeSpace = 8,
    disabled,
  } = props;
  const { width } = useWindowDimensions();
  const size = props.size ?? width - 64;
  const radius = size / 2;
  const center = vec.create(radius);
  const initialPolar = polar2Canvas({
    theta: toRadian(hsv.h.value),
    radius: radius - strokeWidth / 2,
  }, center);
  const rectSize = (radius - strokeWidth) * 2;
  const saturationWidth = Math.sqrt((rectSize ** 2) / 2);
  const rectPoint = polar2Canvas({
    theta: toRadian(135),
    radius: radius - strokeWidth,
  }, center);
  const hueTranslate = useVector(initialPolar.x, initialPolar.y);
  const satTranslate = useVector(0);
  const isGestureActive = props.isGestureActive ?? useSharedValue(false);

  useAnimatedReaction(() => {
    return colors.hsv2Hex(hsv.h.value, hsv.s.value, hsv.v.value);
  }, (value, oldValue) => {
    if (isGestureActive.value && value !== oldValue) {
      runOnJS(onColorChange)(value);
    }
  });

  useAnimatedReaction(() => {
    return polar2Canvas({
      theta: toRadian(hsv.h.value),
      radius: radius - strokeWidth / 2,
    }, center);
  }, (position) => {
    if (!isGestureActive.value) {
      hueTranslate.x.value = withTiming(position.x, timingConfig);
      hueTranslate.y.value = withTiming(position.y, timingConfig);
    }
  });

  const onGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { x: number, y: number }>({
    onStart: (_, ctx) => {
      ctx.x = hueTranslate.x.value;
      ctx.y = hueTranslate.y.value;
      isGestureActive.value = true;
    },
    onActive: (event, ctx) => {
      const transX = event.translationX + ctx.x;
      const transY = event.translationY + ctx.y;
      const polar = canvas2Polar({
        x: transX,
        y: transY,
      }, center);
      const canvas = polar2Canvas({
        theta: polar.theta,
        radius: radius - strokeWidth / 2,
      }, center);

      hsv.h.value = toDeg(polar.theta);
      hueTranslate.x.value = canvas.x;
      hueTranslate.y.value = canvas.y;
      if (resetSaturationWhenHueChange) {
        hsv.v.value = 100;
        hsv.s.value = 100;
        satTranslate.x.value = withTiming(saturationWidth - rectSizeSpace * 2, timingConfig);
        satTranslate.y.value = withTiming(0, timingConfig);
      }
    },
    onFinish: () => {
      isGestureActive.value = false;
      const color = colors.hsv2Hex(hsv.h.value, hsv.s.value, hsv.v.value);
      runOnJS(onColorConfirm)(color);
    },
  });

  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: hueTranslate.x.value },
        { translateY: hueTranslate.y.value },
      ],
    };
  });

  return (
    <View
      style={{ width: size, height: size }}
    >
      <Svg width='100%' height='100%'>
        <Defs>
          <MaskView
            center={center}
            radius={radius - strokeWidth}
          />
        </Defs>
        <CircleLineGradient
          radius={radius}
          center={center}
        />
      </Svg>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        enabled={!disabled}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              width: strokeWidth,
              height: strokeWidth,
              borderRadius: strokeWidth,
              top: -strokeWidth / 2,
              left: -strokeWidth / 2,
              borderWidth: 2,
              borderColor: 'white',
            },
            circleStyle,
          ]}
        />
      </PanGestureHandler>
      <SaturationPicker
        size={saturationWidth}
        top={rectPoint.y}
        left={rectPoint.x}
        satTranslate={satTranslate}
        hsv={hsv}
        isGestureActive={isGestureActive}
        onColorConfirm={onColorConfirm}
        rectSizeSpace={rectSizeSpace}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default React.memo(ColorPickerComponent, equals);
