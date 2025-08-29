import React from 'react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const ChartWrapper = ({ 
  type = 'line', 
  data, 
  options = {}, 
  className = '',
  height = '400px'
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#B3B3B3',
          font: {
            family: 'Inter'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(40, 40, 40, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#B3B3B3',
        borderColor: '#1DB954',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(179, 179, 179, 0.1)'
        },
        ticks: {
          color: '#B3B3B3'
        }
      },
      y: {
        grid: {
          color: 'rgba(179, 179, 179, 0.1)'
        },
        ticks: {
          color: '#B3B3B3'
        }
      }
    }
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={mergedOptions} />
      case 'bar':
        return <Bar data={data} options={mergedOptions} />
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} />
      case 'radar':
        return <Radar data={data} options={mergedOptions} />
      default:
        return <Line data={data} options={mergedOptions} />
    }
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      {renderChart()}
    </div>
  )
}

export default ChartWrapper
