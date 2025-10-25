import React, { useRef, useState, useEffect } from 'react';

export default function Coach({ suggest, onSend, history }) {
  const [message, setMessage] = useState('How can I improve my dinner today?');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="h-[520px] w-full overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900/90">
              {suggest()}
            </div>
            {history.map((m, idx) => (
              <div key={idx} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 p-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about nutrition or workouts..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-orange-400"
            />
            <button className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">Send</button>
          </form>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">Coach Tips</div>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            <li>Protein at each meal boosts satiety.</li>
            <li>Plan carbs around training for energy.</li>
            <li>Hydrate: 30-35 ml/kg body weight daily.</li>
            <li>7-8 hours of sleep supports recovery.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 text-sm text-orange-900/90">
          Your AI replies are generated locally for this demo. Integrate OpenAI or Gemini in production.
        </div>
      </aside>
    </div>
  );
}
