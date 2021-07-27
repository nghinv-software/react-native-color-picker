/**
 * Created by nghinv on Fri Jul 23 2021
 * Copyright (c) 2021 nghinv@lumi.biz
 */

import React from 'react';
import equals from 'react-fast-compare';
import { G, Path } from 'react-native-svg';
import type { Point } from '@nghinv/react-native-animated';
import { generateConicGradient } from '../utils';

interface CircleLineGradientProps {
  radius: number,
  center: Point;
}

CircleLineGradient.defaultProps = {

};

function CircleLineGradient(props: CircleLineGradientProps) {
  const {
    radius,
    center,
  } = props;
  const paths = generateConicGradient(radius, 2);

  return (
    <G
      translateX={center.x}
      translateY={center.y}
    >
      <G
        rotation='90'
      >
        <G
          translateX={-center.x}
          translateY={-center.y}
        >
          <G
            mask="url(#mask)"
          >
            {
              paths.map((path, index) => {
                return (
                  <Path
                    key={index}
                    d={path.d}
                    fill={path.fill}
                  />
                );
              })
            }
          </G>
        </G>
      </G>
    </G>
  );
}

export default React.memo(CircleLineGradient, equals);
