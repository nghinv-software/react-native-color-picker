/**
 * Created by nghinv on Fri Jul 23 2021
 * Copyright (c) 2021 nghinv@lumi.biz
 */

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M', start.x, start.y,
    'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
    'L', x, y,
    'L', start.x, start.y,
  ].join(' ');

  return d;
}

export function generateConicGradient(
  radius: number,
  resolution: number,
) {
  const path = [];

  for (let i = 0; i < 360 * resolution; i++) {
    const d = describeArc(
      radius,
      radius,
      radius,
      i / resolution,
      (i + 2) / resolution,
    );
    const fill = `hsl(${(360 * resolution - i) / resolution}, 100%, 50%)`;

    path.push({
      d,
      fill,
    });
  }

  return path;
}
