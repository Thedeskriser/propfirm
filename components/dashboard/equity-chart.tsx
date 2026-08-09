'use client'

import { useEffect, useRef, useMemo } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import { fmtUSD, toNum } from '@/lib/format'

interface EquityPoint { date: string; balance: number }

interface Props {
  data:   EquityPoint[]
  height?: number
}

export function EquityChart({ data, height = 280 }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  const seriesData = useMemo(() => {
    return data
      .map((p) => ({
        time: Math.floor(new Date(p.date).getTime() / 1000),
        value: toNum(p.balance),
      }))
      .filter((p) => Number.isFinite(p.value))
      .sort((a, b) => a.time - b.time)
      // lightweight-charts requires strictly increasing time values
      .reduce((acc, curr) => {
          if (acc.length > 0 && acc[acc.length - 1].time >= curr.time) {
              curr.time = acc[acc.length - 1].time + 1
          }
          acc.push(curr)
          return acc
      }, [] as {time: number, value: number}[])
  }, [data])

  useEffect(() => {
    if (!chartContainerRef.current || seriesData.length === 0) return

    const up = seriesData.length > 1 ? seriesData[seriesData.length - 1].value >= seriesData[0].value : true
    const lineColor = up ? '#10B981' : '#ef4444' // success : danger
    const topColor = up ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
    const bottomColor = up ? 'rgba(16, 185, 129, 0)' : 'rgba(239, 68, 68, 0)'

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(156,163,175,0.8)',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)', style: 3 }, // dashed
        horzLines: { color: 'rgba(255,255,255,0.06)', style: 3 },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        mode: 1, // Magnet
      },
      handleScroll: false,
      handleScale: false,
    })

    const areaSeries = chart.addAreaSeries({
      lineColor,
      topColor,
      bottomColor,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    areaSeries.setData(seriesData as any)
    chart.timeScale().fitContent()

    chartRef.current = chart

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [seriesData, height])

  if (seriesData.length === 0) {
    return (
      <div className="h-full min-h-[200px] flex items-center justify-center text-sm text-text-muted px-6 pb-6" style={{ height }}>
        Not enough data to draw the equity curve yet.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }} className="px-2 pb-2">
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
