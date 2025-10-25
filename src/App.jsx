import React, { useEffect, useMemo, useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import Coach from './components/Coach';

const LOCAL_STORAGE_KEYS = {
  profile: 'healthifylite_profile',
  logs: 'healthifylite_logs',
  chat: 'healthifylite_chat',
};

const defaultFoods = [
  { id: 'f1', name: 'Boiled Egg (1)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { id: 'f2', name: 'Grilled Chicken (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'f3', name: 'Paneer (100g)', calories: 296, protein: 23, carbs: 6, fat: 22 },
  { id: 'f4', name: 'Oats (40g dry)', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: 'f5', name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: 'f6', name: 'Rice (1 cup cooked)', calories: 206, protein: 4.2, carbs: 45, fat: 0.4 },
  { id: 'f7', name: 'Roti (1 medium)', calories: 120, protein: 3.1, carbs: 18, fat: 3.7 },
  { id: 'f8', name: 'Greek Yogurt (170g)', calories: 100, protein: 17, carbs: 6, fat: 0 },
  { id: 'f9', name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: 'f10', name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
];

const defaultWorkouts = [
  { id: 'w1', type: 'Running', met: 9.8 },
  { id: 'w2', type: 'Walking', met: 3.5 },
  { id: 'w3', type: 'Cycling', met: 8.0 },
  { id: 'w4', type: 'Yoga', met: 2.5 },
  { id: 'w5', type: 'Strength Training', met: 6.0 },
];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

function calculateBMR({ gender, age, heightCm, weightKg }) {
  if (!gender || !age || !heightCm || !weightKg) return 0;
  if (gender === 'male') return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function activityMultiplier(level) {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'veryactive':
      return 1.9;
    default:
      return 1.2;
  }
}

function goalAdjustment(goal) {
  switch (goal) {
    case 'lose':
      return -400;
    case 'gain':
      return 300;
    default:
      return 0;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [foods] = useState(defaultFoods);
  const [workouts] = useState(defaultWorkouts);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.profile);
    return (
      (saved && JSON.parse(saved)) || {
        name: 'Guest',
        age: 28,
        gender: 'male',
        heightCm: 175,
        weightKg: 70,
        activityLevel: 'light',
        goal: 'maintain',
      }
    );
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.logs);
    return (saved && JSON.parse(saved)) || {};
  });

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.chat);
    return (
      (saved && JSON.parse(saved)) || [
        { role: 'system', content: 'Your AI Health Coach is here to help with nutrition and workouts.' },
      ]
    );
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.logs, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.chat, JSON.stringify(chatHistory));
  }, [chatHistory]);

  const todayKey = getTodayKey();

  const ensureDay = (dateKey) => {
    setLogs((prev) => {
      if (prev[dateKey]) return prev;
      return { ...prev, [dateKey]: { foods: [], workouts: [] } };
    });
  };

  useEffect(() => {
    ensureDay(todayKey);
  }, []);

  const tdeeTarget = useMemo(() => {
    const bmr = calculateBMR(profile);
    const tdee = bmr * activityMultiplier(profile.activityLevel);
    return Math.max(1200, Math.round(tdee + goalAdjustment(profile.goal)));
  }, [profile]);

  const addFood = (dateKey, entry) => {
    setLogs((prev) => {
      const day = prev[dateKey] || { foods: [], workouts: [] };
      const foodsList = [...day.foods, { ...entry, id: crypto.randomUUID() }];
      return { ...prev, [dateKey]: { ...day, foods: foodsList } };
    });
  };

  const removeFood = (dateKey, id) => {
    setLogs((prev) => {
      const day = prev[dateKey];
      if (!day) return prev;
      return { ...prev, [dateKey]: { ...day, foods: day.foods.filter((f) => f.id !== id) } };
    });
  };

  const addWorkout = (dateKey, entry) => {
    setLogs((prev) => {
      const day = prev[dateKey] || { foods: [], workouts: [] };
      const workoutsList = [...day.workouts, { ...entry, id: crypto.randomUUID() }];
      return { ...prev, [dateKey]: { ...day, workouts: workoutsList } };
    });
  };

  const removeWorkout = (dateKey, id) => {
    setLogs((prev) => {
      const day = prev[dateKey];
      if (!day) return prev;
      return { ...prev, [dateKey]: { ...day, workouts: day.workouts.filter((w) => w.id !== id) } };
    });
  };

  const getDayTotals = (dateKey) => {
    const day = logs[dateKey] || { foods: [], workouts: [] };
    const totals = day.foods.reduce(
      (acc, f) => {
        acc.calories += f.calories;
        acc.protein += f.protein;
        acc.carbs += f.carbs;
        acc.fat += f.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const burned = day.workouts.reduce((acc, w) => acc + w.calories, 0);
    return { ...totals, burned };
  };

  const last7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const { calories, burned, protein, carbs, fat } = getDayTotals(key);
      days.push({ key, calories, burned, protein, carbs, fat });
    }
    return days;
  }, [logs]);

  const coachSuggest = (dateKey) => {
    const { calories, burned, protein, carbs, fat } = getDayTotals(dateKey);
    const net = calories - burned;
    let msg = `Today net calories: ${net} kcal (consumed ${calories} / burned ${burned}). `;
    const proteinTarget = Math.round((profile.weightKg || 70) * 1.6);
    if (protein < proteinTarget) {
      msg += `You're short on protein (target ~${proteinTarget}g). Consider eggs, paneer, or Greek yogurt. `;
    } else {
      msg += `Great protein intake today. `;
    }
    const carbFatRatio = carbs && fat ? carbs / Math.max(1, fat) : 0;
    if (carbFatRatio < 2) msg += 'Carbs could be slightly higher for energy if you plan to train. ';
    if (net > tdeeTarget + 200) msg += 'You are over your goal; add a light walk to balance. ';
    if (net < tdeeTarget - 300) msg += 'You are under your goal; add a snack like nuts or banana. ';
    return msg.trim();
  };

  const handleChat = async (userMessage) => {
    const contextTip = coachSuggest(todayKey);
    const assistant = `Tip based on your day: ${contextTip}\n\nAnswer: `;
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
      {
        role: 'assistant',
        content:
          assistant +
          (userMessage.toLowerCase().includes('protein')
            ? 'Focus on lean proteins like chicken, fish, tofu, paneer, and eggs. Aim for 20-40g per meal.'
            : userMessage.toLowerCase().includes('lose')
            ? 'Maintain a modest 300-500 kcal deficit, prioritize protein and whole foods, and get 7-8h sleep.'
            : 'Balance your plate: protein, smart carbs, healthy fats, and plenty of fiber. Stay hydrated.'),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white text-slate-800">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">Healthify-Lite</h1>
            <p className="text-sm text-slate-500">Smart tracking • Simple insights</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Hello,</div>
            <div className="font-semibold">{profile.name || 'Guest'}</div>
          </div>
        </header>

        <NavBar active={activeTab} onChange={setActiveTab} />

        <main className="mt-6">
          {activeTab === 'Dashboard' && (
            <Dashboard
              profile={profile}
              targetCalories={tdeeTarget}
              todayTotals={getDayTotals(todayKey)}
              last7Days={last7Days}
            />
          )}
          {activeTab === 'Logs' && (
            <Logs
              dateKey={todayKey}
              foodsCatalog={foods}
              workoutsCatalog={workouts}
              profile={profile}
              day={logs[todayKey] || { foods: [], workouts: [] }}
              addFood={addFood}
              removeFood={removeFood}
              addWorkout={addWorkout}
              removeWorkout={removeWorkout}
              computeTotals={() => getDayTotals(todayKey)}
              onUpdateProfile={setProfile}
            />
          )}
          {activeTab === 'Coach' && (
            <Coach
              suggest={() => coachSuggest(todayKey)}
              onSend={handleChat}
              history={chatHistory.filter((m) => m.role !== 'system')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
