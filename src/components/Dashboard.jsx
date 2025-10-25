import React from 'react';

function Donut({ value = 0, max = 100, size = 140, stroke = 14, color = '#f97316', bg = '#fde68a' }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);
  const dash = pct * circ;
  return (
    <svg width={size} height={size} className="block">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={bg} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash}, ${circ}`}
          strokeLinecap="round"
        />
      </g>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-slate-800 text-xl font-bold">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function Sparkline({ data = [], color = '#f97316' }) {
  if (!data.length) return null;
  const width = 240;
  const height = 60;
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const pad = 8;
  const points = data.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (data.length - 1 || 1);
    const y = height - pad - ((v - minVal) / Math.max(1, maxVal - minVal)) * (height - pad * 2);
    return `${x},${y}`;
  });
  const stroke = color;
  return (
    <svg width={width} height={height} className="block">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points.join(' ')} />
    </svg>
  );
}

function Stat({ label, value, suffix = '', accent = false }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-white'} `}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-800">
        {value}
        {suffix}
      </div>
    </div>
  );
}

export default function Dashboard({ profile, targetCalories, todayTotals, last7Days }) {
  const net = todayTotals.calories - todayTotals.burned;
  const remaining = Math.max(0, targetCalories - net);
  const macroTotal = Math.max(1, todayTotals.protein + todayTotals.carbs + todayTotals.fat);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Goal" value={targetCalories} suffix=" kcal" accent />
          <Stat label="Consumed" value={Math.round(todayTotals.calories)} suffix=" kcal" />
          <Stat label="Burned" value={Math.round(todayTotals.burned)} suffix=" kcal" />
          <Stat label="Remaining" value={Math.round(remaining)} suffix=" kcal" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="mb-3 text-sm font-medium text-slate-600">Calories Progress</div>
            <div className="flex items-center gap-6">
              <Donut value={net} max={targetCalories} />
              <div>
                <div className="text-sm text-slate-500">Net Today</div>
                <div className="text-3xl font-bold text-slate-800">{Math.round(net)} kcal</div>
                <div className="mt-2 text-xs text-slate-500">Consumed {Math.round(todayTotals.calories)} - Burned {Math.round(todayTotals.burned)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="mb-3 text-sm font-medium text-slate-600">Macro Breakdown</div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Protein</span>
                  <span>{Math.round(todayTotals.protein)}g</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${(todayTotals.protein / macroTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Carbs</span>
                  <span>{Math.round(todayTotals.carbs)}g</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-orange-400" style={{ width: `${(todayTotals.carbs / macroTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Fat</span>
                  <span>{Math.round(todayTotals.fat)}g</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${(todayTotals.fat / macroTotal) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-slate-600">Last 7 Days Trend (Net Calories)</div>
          <Sparkline data={last7Days.map((d) => d.calories - d.burned)} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500 md:grid-cols-7">
            {last7Days.map((d) => (
              <div key={d.key} className="rounded-md bg-orange-50 px-2 py-1 text-center font-medium text-orange-700">
                {d.key.slice(5)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4">
          <div className="text-sm font-medium text-orange-700">Quick Tip</div>
          <p className="mt-1 text-sm text-orange-900/80">
            Aim for at least {Math.round((profile.weightKg || 70) * 1.6)}g protein today. Spread across 3–4 meals.
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">Profile Snapshot</div>
          <ul className="text-sm text-slate-700">
            <li>Age: {profile.age}</li>
            <li>Gender: {profile.gender}</li>
            <li>Height: {profile.heightCm} cm</li>
            <li>Weight: {profile.weightKg} kg</li>
            <li>Activity: {profile.activityLevel}</li>
            <li>Goal: {profile.goal}</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
