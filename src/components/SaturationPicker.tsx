/**
 * Created by nghinv on Fri Jul 23 2021
 * Copyright (c) 2021 nghinv@lumi.biz
 */

import React, { useState } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import equals from 'react-fast-compare';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useAnimatedProps, processColor, runOnJS, useAnimatedReaction, withTiming } from 'react-native-reanimated';
import { colors, timingConfig, HsvAnimated, clamp, VectorAnimated } from '@nghinv/react-native-animated';
import LinearGradient from 'react-native-linear-gradient';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const LinearGradientAnimated = Animated.createAnimatedComponent(LinearGradient);
const IS_ANDROID = Platform.OS === 'android';

interface SaturationPickerProps {
  size: number;
  top: number;
  left: number;
  satTranslate: VectorAnimated;
  disabled?: boolean;
  circleRadius?: number;
  rectSizeSpace: number;
  hsv: HsvAnimated;
  isGestureActive: Animated.SharedValue<boolean>;
  onColorConfirm: (color: string) => void;
}

function SaturationPicker(props: SaturationPickerProps) {
  const {
    size,
    top,
    left,
    satTranslate,
    circleRadius = 8,
    rectSizeSpace,
    hsv,
    isGestureActive,
    onColorConfirm,
    disabled,
  } = props;
  const rectSize = size - rectSizeSpace * 2;
  const [stopColors, setStopColors] = useState<any>([
    '#ffffff',
    colors.hsv2Hex(hsv.h.value, 100, 100),
  ]);

  const onGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (event) => {
      satTranslate.x.value = event.x - rectSizeSpace;
      satTranslate.y.value = event.y - rectSizeSpace;
      isGestureActive.value = true;
    },
    onActive: (event) => {
      satTranslate.x.value = clamp(event.x - rectSizeSpace, 0, rectSize);
      satTranslate.y.value = clamp(event.y - rectSizeSpace, 0, rectSize);
      hsv.s.value = satTranslate.x.value * (100 / rectSize);
      hsv.v.value = 100 - satTranslate.y.value * (100 / rectSize);
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
        { translateX: satTranslate.x.value },
        { translateY: satTranslate.y.value },
      ],
    };
  });

  const setColorAndroid = (colorsStop: any) => {
    setStopColors(colorsStop);
  };

  useAnimatedReaction(() => {
    return hsv.h.value;
  }, (value, oldValue) => {
    if (IS_ANDROID && value !== oldValue) {
      const stopColor = colors.hsv2Hex(value, 100, 100);
      runOnJS(setColorAndroid)([
        '#ffffff',
        stopColor,
      ]);
    }
  });

  useAnimatedReaction(() => {
    return {
      s: hsv.s.value,
      v: hsv.v.value,
    };
  }, ({ s, v }) => {
    if (!isGestureActive.value) {
      satTranslate.x.value = withTiming(s * (rectSize / 100), timingConfig);
      satTranslate.y.value = withTiming((100 - v) * (rectSize / 100), timingConfig);
    }
  });

  // @ts-ignore
  const animatedProps = useAnimatedProps(() => {
    if (IS_ANDROID) {
      return {};
    }

    const stopColor = colors.hsv2Hex(hsv.h.value, 100, 100);
    return {
      colors: [
        processColor('#ffffff'),
        isGestureActive.value ? processColor(stopColor) : withTiming(processColor(stopColor)),
      ],
    };
  });

  return (
    <PanGestureHandler enabled={!disabled} onGestureEvent={onGestureEvent}>
      <Animated.View
        style={[
          styles.container,
          {
            top,
            left,
            width: size,
            height: size,
          },
        ]}
      >
        <View style={{ margin: rectSizeSpace }}>
          {
            Platform.OS === 'android' ? (
              <LinearGradient
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                colors={stopColors}
              >
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', '#000']}
                  style={{
                    height: rectSize,
                    width: rectSize,
                  }}
                />
              </LinearGradient>
            ) : (
              // @ts-ignore
              <LinearGradientAnimated
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                animatedProps={animatedProps}
              >
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', '#000']}
                  style={{
                    height: rectSize,
                    width: rectSize,
                  }}
                />
              </LinearGradientAnimated>
            )
          }

          <Animated.View
            pointerEvents='none'
            style={[
              styles.circle,
              {
                width: circleRadius * 2,
                height: circleRadius * 2,
                top: -circleRadius,
                left: -circleRadius,
                borderRadius: circleRadius,
              },
              circleStyle,
            ]}
          />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'white',
  },
});

export default React.memo(SaturationPicker, equals);
