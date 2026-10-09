import { useState } from 'react';

export default function AnalyticsWidget({ stats }) {
  const [chartView, setChartView] = useState('weekly');
  const total = stats?.totalEmployees || 150;
  const presentPct = Math.round(((stats?.present || 120) / total) * 100);
  const latePct = Math.round(((stats?.late || 8) / total) * 100);
  const wfhPct = Math.round(((stats?.wfh || 5) / total) * 100);
  const absentPct = Math.round(((stats?.absent || 10) / total) * 100);

  const departments = [
    { name: 'Engineering', count: 42, pct: 95, tone: '#6366f1' },
    { name: 'HR & Operations', count: 18, pct: 88, tone: '#10b981' },
    { name: 'Sales & Marketing', count: 35, pct: 90, tone: '#f59e0b' },
    { name: 'Finance & Legal', count: 15, pct: 93, tone: '#a855f7' },
    { name: 'Customer Support', count: 25, pct: 86, tone: '#38bdf8' },
  ];

  const weeklyTrend = [
    { day: 'Mon', present: 92, late: 5 },
    { day: 'Tue', present: 95, late: 3 },
    { day: 'Wed', present: 94, late: 4 },
    { day: 'Thu', present: 96, late: 2 },
    { day: 'Fri', present: 91, late: 6 },
    { day: 'Sat', present: 88, late: 4 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      {/* CHART 1: STATUS BREAKDOWN & TREND */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Attendance Distribution & Trend</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Real-time workforce ratio & weekly curves</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--input-bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button
              className={`btn btn-sm ${chartView === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartView('weekly')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', border: 'none' }}
            >
              Weekly Trend
            </button>
            <button
              className={`btn btn-sm ${chartView === 'status' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartView('status')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', border: 'none' }}
            >
              Status Bar
            </button>
          </div>
        </div>

        {chartView === 'status' ? (
          <div className="chart-container">
            <div className="bar-wrapper">
              <div className="chart-bar" style={{ height: `${presentPct}%`, background: 'var(--success)' }} />
              <span className="bar-label">{presentPct}% Present</span>
            </div>
            <div className="bar-wrapper">
              <div className="chart-bar" style={{ height: `${latePct}%`, background: 'var(--warning)' }} />
              <span className="bar-label">{latePct}% Late</span>
            </div>
            <div className="bar-wrapper">
              <div className="chart-bar" style={{ height: `${wfhPct}%`, background: 'var(--info)' }} />
              <span className="bar-label">{wfhPct}% WFH</span>
            </div>
            <div className="bar-wrapper">
              <div className="chart-bar" style={{ height: `${absentPct}%`, background: 'var(--danger)' }} />
              <span className="bar-label">{absentPct}% Absent</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>🟢 Present %</span>
              <span>🟡 Late %</span>
            </div>
            <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '8px', borderBottom: '1px dashed var(--border)' }}>
              {weeklyTrend.map((t) => (
                <div key={t.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', display: 'flex', gap: '4px', height: '100%', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        flex: 1,
                        height: `${t.present}%`,
                        background: 'linear-gradient(180deg, #10b981, #059669)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                      title={`${t.day}: ${t.present}% Present`}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: `${t.late * 6}%`,
                        background: '#f59e0b',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                      title={`${t.day}: ${t.late}% Late`}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHART 2: DEPARTMENT COMPLIANCE */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>Department Compliance & Attendance</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>Enrolled workforce vs verified check-in percentage</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {departments.map((dept) => (
            <div key={dept.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                <span>{dept.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({dept.count} staff)</span></span>
                <span style={{ color: dept.tone }}>{dept.pct}%</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${dept.pct}%`,
                    background: dept.tone,
                    borderRadius: '999px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
