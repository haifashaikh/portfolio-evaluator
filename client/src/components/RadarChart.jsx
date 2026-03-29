import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import './RadarChart.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = ['Activity', 'Code Quality', 'Diversity', 'Community', 'Hiring Ready'];

export default function RadarChart({ scores, compareScores = null, username = '', compareUsername = '' }) {
  if (!scores) return null;

  const values = [
    scores.activity,
    scores.codeQuality,
    scores.diversity,
    scores.community,
    scores.hiringReady,
  ];

  const datasets = [
    {
      label: username || 'User',
      data: values,
      backgroundColor: 'rgba(124, 58, 237, 0.15)',
      borderColor: 'rgba(167, 139, 250, 0.9)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(167, 139, 250, 1)',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ];

  if (compareScores) {
    datasets.push({
      label: compareUsername || 'User 2',
      data: [
        compareScores.activity,
        compareScores.codeQuality,
        compareScores.diversity,
        compareScores.community,
        compareScores.hiringReady,
      ],
      backgroundColor: 'rgba(6, 182, 212, 0.12)',
      borderColor: 'rgba(6, 182, 212, 0.9)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(6, 182, 212, 1)',
      pointRadius: 4,
      pointHoverRadius: 6,
    });
  }

  const data = { labels: LABELS, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: 'rgba(90, 86, 112, 0.8)',
          backdropColor: 'transparent',
          font: { family: 'Space Mono', size: 10 },
        },
        grid: { color: 'rgba(34, 34, 47, 0.8)' },
        angleLines: { color: 'rgba(34, 34, 47, 0.8)' },
        pointLabels: {
          color: '#9994b8',
          font: { family: 'Syne', size: 12, weight: '600' },
        },
      },
    },
    plugins: {
      legend: {
        display: !!compareScores,
        labels: {
          color: '#9994b8',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: '#13131c',
        borderColor: '#22222f',
        borderWidth: 1,
        titleColor: '#f1f0ff',
        bodyColor: '#9994b8',
        titleFont: { family: 'Syne', weight: '700' },
        bodyFont: { family: 'Space Mono', size: 12 },
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}/100`,
        },
      },
    },
  };

  return (
    <div className="radar-card card animate-fadeUp delay-1">
      <h2 className="radar-card__title">Category Breakdown</h2>
      <div className="radar-card__chart">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
