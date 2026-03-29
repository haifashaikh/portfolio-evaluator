import './HeatMap.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLevel(count) {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function buildGrid(heatmapData) {
  // Build 52 weeks × 7 days grid starting from 52 weeks ago
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  let current = new Date(startDate);

  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        count: heatmapData[dateStr] || 0,
        month: current.getMonth(),
        day: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = week[0].month;
    if (m !== lastMonth) {
      labels.push({ index: i, label: MONTHS[m] });
      lastMonth = m;
    }
  });
  return labels;
}

export default function HeatMap({ heatmapData = {} }) {
  const weeks = buildGrid(heatmapData);
  const monthLabels = buildMonthLabels(weeks);
  const totalCommits = Object.values(heatmapData).reduce((s, v) => s + v, 0);

  return (
    <div className="heatmap card animate-fadeUp delay-2">
      <div className="heatmap__header">
        <h2 className="heatmap__title">Contribution Activity</h2>
        <span className="mono heatmap__total">{totalCommits} commits in the last year</span>
      </div>

      <div className="heatmap__scroll">
        <div className="heatmap__grid-wrap">
          {/* Month labels */}
          <div className="heatmap__months">
            <div style={{ width: 32 }} />
            {monthLabels.map(({ index, label }) => (
              <div
                key={`${label}-${index}`}
                className="heatmap__month-label"
                style={{ gridColumn: index + 1 }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="heatmap__body">
            {/* Day labels */}
            <div className="heatmap__days">
              {DAYS.map((d, i) => (
                <div key={d} className="heatmap__day-label" style={{ gridRow: i + 1 }}>
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="heatmap__cells">
              {weeks.map((week, wi) =>
                week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`heatmap__cell heatmap__cell--level-${getLevel(cell.count)}`}
                    title={`${cell.date}: ${cell.count} commit${cell.count !== 1 ? 's' : ''}`}
                    style={{ gridColumn: wi + 1, gridRow: di + 1 }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap__legend">
        <span className="heatmap__legend-label">Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`heatmap__cell heatmap__cell--level-${l}`} />
        ))}
        <span className="heatmap__legend-label">More</span>
      </div>
    </div>
  );
}
