import React, { useMemo } from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

type Props = {
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
  barWidth?: number;
  primaryColor: string;
  mutedColor: string;
  labelColor: string;
  highlightIndex?: number;
};

export default function BarChart({
  data,
  labels,
  width,
  height = 90,
  barWidth = 28,
  primaryColor,
  mutedColor,
  labelColor,
  highlightIndex,
}: Props) {
  const max = useMemo(() => Math.max(...data, 1), [data]);
  const chartHeight = height;
  const svgWidth = width ?? barWidth * data.length + 20;

  return (
    <Svg width={svgWidth} height={chartHeight + 24}>
      {data.map((value, i) => {
        const barHeight = (value / max) * chartHeight;
        const x = i * barWidth + 10;
        const y = chartHeight - barHeight;
        const fill = highlightIndex === i ? primaryColor : mutedColor;

        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth - 6}
              height={barHeight}
              rx={4}
              fill={fill}
            />
            <SvgText
              x={x + (barWidth - 6) / 2}
              y={chartHeight + 16}
              fontSize={10}
              textAnchor="middle"
              fill={labelColor}
            >
              {labels[i] ?? ''}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
