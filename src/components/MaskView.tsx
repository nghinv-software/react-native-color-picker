/**
 * Created by nghinv on Fri Jul 23 2021
 * Copyright (c) 2021 nghinv@lumi.biz
 */

import React from 'react';
import equals from 'react-fast-compare';
import { Circle, Mask, Rect } from 'react-native-svg';
import type { Point } from '@nghinv/react-native-animated';

interface MaskViewProps {
  radius: number,
  center: Point;
}

function MaskView(props: MaskViewProps) {
  const { radius, center } = props;
  return (
    <Mask id="mask" x="0" y="0" height="100%" width="100%">
      <Rect height="100%" width="100%" fill="#fff" />
      <Circle
        r={radius}
        cx={center.x}
        cy={center.y}
        fill='black'
      />
    </Mask>
  );
}

export default React.memo(MaskView, equals);
