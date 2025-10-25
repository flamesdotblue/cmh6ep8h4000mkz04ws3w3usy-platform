import React, { useMemo, useState } from 'react';

export default function Logs({
  dateKey,
  foodsCatalog,
  workoutsCatalog,
  profile,
  day,
  addFood,
  removeFood,
  addWorkout,
  removeWorkout,
  computeTotals,
  onUpdateProfile,
}) {
  const [foodQuery, setFoodQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedFood, setSelectedFood] = useState(null);

  const [workoutType, setWorkoutType] = useState(workoutsCatalog[0]?.type || 'Running');
  const [duration, setDuration] = useState(30);

  const weightKg = profile.weightKg || 70;

  const filteredFoods = useMemo(() => {
    const q = foodQuery.trim().toLowerCase();
    if (!q) return foodsCatalog.slice(0, 6);
    return foodsCatalog.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [foodQuery, foodsCatalog]);

  const handleAddFood = () => {
    if (!selectedFood) return;
    const q = Math.max(0.25, Number(quantity) || 1);
    addFood(dateKey, {
      name: selectedFood.name + (q !== 1 ? ` x${q}` : ''),
      calories: selectedFood.calories * q,
      protein: selectedFood.protein * q,
      carbs: selectedFood.carbs * q,
      fat: selectedFood.fat * q,
    });
    setSelectedFood(null);
    setQuantity(1);
    setFoodQuery('');
  };

  const handleAddWorkout = () => {
    const wk = workoutsCatalog.find((w) => w.type === workoutType);
    if (!wk) return;
    const dur = Math.max(5, Number(duration) || 30);
    const kcal = wk.met * weightKg * (dur / 60);
    addWorkout(dateKey, {
      type: wk.type,
      durationMin: dur,
      calories: Math.round(kcal),
    });
  };

  const totals = computeTotals();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-slate-600">Add Food</div>
          <div className="grid items-end gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <input
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                placeholder="Search food (e.g., egg, paneer, oats)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {filteredFoods.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFood(f)}
                    className={`truncate rounded-md border px-2 py-1 text-left text-sm ${
                      selectedFood?.id === f.id ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    title={`${f.name} • ${f.calories} kcal`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Quantity</label>
              <input
                type="number"
                min={0.25}
                step={0.25}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <button
                onClick={handleAddFood}
                disabled={!selectedFood}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-slate-600">Food Log</div>
          {!day.foods.length ? (
            <div className="text-sm text-slate-500">No foods added yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {day.foods.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{f.name}</div>
                    <div className="text-xs text-slate-500">
                      {Math.round(f.calories)} kcal • P {Math.round(f.protein)}g • C {Math.round(f.carbs)}g • F {Math.round(f.fat)}g
                    </div>
                  </div>
                  <button
                    onClick={() => removeFood(dateKey, f.id)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-slate-600">Add Workout</div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Type</label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-orange-400"
              >
                {workoutsCatalog.map((w) => (
                  <option key={w.id} value={w.type}>
                    {w.type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Duration (min)</label>
              <input
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
              />
            </div>
            <button
              onClick={handleAddWorkout}
              className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-900"
            >
              Add Workout
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-slate-600">Workouts</div>
          {!day.workouts.length ? (
            <div className="text-sm text-slate-500">No workouts added yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {day.workouts.map((w) => (
                <li key={w.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{w.type}</div>
                    <div className="text-xs text-slate-500">{w.durationMin} min • {w.calories} kcal</div>
                  </div>
                  <button
                    onClick={() => removeWorkout(dateKey, w.id)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4">
          <div className="mb-2 text-sm font-medium text-orange-700">Today Summary</div>
          <ul className="text-sm text-orange-900/80">
            <li>Calories: {Math.round(totals.calories)} kcal</li>
            <li>Burned: {Math.round(totals.burned)} kcal</li>
            <li>Protein: {Math.round(totals.protein)} g</li>
            <li>Carbs: {Math.round(totals.carbs)} g</li>
            <li>Fat: {Math.round(totals.fat)} g</li>
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateProfile({ ...profile, weightKg: Math.max(20, (profile.weightKg || 70) - 0.5) })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              -0.5 kg
            </button>
            <button
              onClick={() => onUpdateProfile({ ...profile, weightKg: (profile.weightKg || 70) + 0.5 })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              +0.5 kg
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
