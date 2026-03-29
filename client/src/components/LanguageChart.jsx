import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import './LanguageChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function LanguageChart({ languages = [] }) {
  if (!languages.length) return null;

  const data = {
    labels: languages.map((l) => l.name),
    datasets: [
      {
        data: languages.map((l) => l.percent),
        backgroundColor: languages.map((l) => l.color || '#7c3aed'),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#13131c',
        borderColor: '#22222f',
        borderWidth: 1,
        titleColor: '#f1f0ff',
        bodyColor: '#9994b8',
        titleFont: { family: 'Syne', weight: '700' },
        bodyFont: { family: 'Space Mono', size: 12 },
        callbacks: {
          label: (ctx) => ` ${ctx.raw}% of repos`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(34,34,47,0.6)' },
        ticks: {
          color: '#5a5670',
          font: { family: 'Space Mono', size: 10 },
          callback: (v) => `${v}%`,
        },
        border: { color: 'transparent' },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#9994b8',
          font: { family: 'Space Mono', size: 11 },
        },
        border: { color: 'transparent' },
      },
    },
  };

  return (
    <div className="lang-chart card animate-fadeUp delay-4">
      <h2 className="lang-chart__title">Language Distribution</h2>
      <div className="lang-chart__chart">
        <Bar data={data} options={options} />
      </div>

      {/* Pill legend */}
      <div className="lang-chart__pills">
        {languages.map((l) => (
          <div key={l.name} className="lang-pill">
            <span className="lang-pill__dot" style={{ background: l.color || '#7c3aed' }} />
            <span className="lang-pill__name">{l.name}</span>
            <span className="lang-pill__pct mono">{l.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
