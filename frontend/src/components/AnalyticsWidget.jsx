export default function AnalyticsWidget({ stats }) {
  const total = stats?.totalEmployees || 150;
  const presentPct = Math.round(((stats?.present || 120) / total) * 100);
  const latePct = Math.round(((stats?.late || 8) / total) * 100);
  const wfhPct = Math.round(((stats?.wfh || 5) / total) * 100);
  const absentPct = Math.round(((stats?.absent || 10) / total) * 100);

  const departments = [
    { name: 'Engineering', count: 42, pct: 95 },
    { name: 'HR & Operations', count: 18, pct: 88 },
    { name: 'Sales & Marketing', count: 35, pct: 90 },
    { name: 'Finance & Legal', count: 15, pct: 93 },
    { name: 'Customer Support', count: 25, pct: 86 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>Attendance Breakdown</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>Real-time status percentage distribution</p>

        <div className="chart-container">
          <div className="bar-wrapper">
            <div className="chart-bar" style={{ height: `${presentPct}%`, background: 'var(--success)' }}></div>
            <span className="bar-label">{presentPct}% Present</span>
          </div>
          <div className="bar-wrapper">
            <div className="chart-bar" style={{ height: `${latePct}%`, background: 'var(--warning)' }}></div>
            <span className="bar-label">{latePct}% Late</span>
          </div>
          <div className="bar-wrapper">
            <div className="chart-bar" style={{ height: `${wfhPct}%`, background: 'var(--info)' }}></div>
            <span className="bar-label">{wfhPct}% WFH</span>
          </div>
          <div className="bar-wrapper">
            <div className="chart-bar" style={{ height: `${absentPct}%`, background: 'var(--danger)' }}></div>
            <span className="bar-label">{absentPct}% Absent</span>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>Department Compliance</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>Average attendance rate by department</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {departments.map((dept) => (
            <div key={dept.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                <span>{dept.name}</span>
                <span>{dept.pct}%</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${dept.pct}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--info))',
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
