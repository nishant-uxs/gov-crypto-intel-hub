
export default function AdminAiConfig() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">AI Brief Configuration</h1>
      <div className="card space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Anthropic API Key</label>
          <input type="password" className="input-field" defaultValue="••••••••" readOnly />
          <p className="text-xs text-gray-500 mt-1">Set via ANTHROPIC_API_KEY in .env</p>
        </div>
        <div><label className="block text-sm text-gray-400 mb-1">Model</label>
          <select className="select-field" defaultValue="claude-sonnet-4-20250514">
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommended)</option>
            <option value="claude-haiku-4-20250514">Claude Haiku 4 (Faster, cheaper)</option>
          </select>
        </div>
        <div><label className="block text-sm text-gray-400 mb-1">Auto-refresh Interval</label>
          <select className="select-field" defaultValue="15">
            <option value="5">Every 5 minutes</option><option value="15">Every 15 minutes</option>
            <option value="30">Every 30 minutes</option><option value="60">Every hour</option>
          </select>
        </div>
        <div><label className="block text-sm text-gray-400 mb-1">News Items for Context</label>
          <input type="number" className="input-field" defaultValue="20" />
          <p className="text-xs text-gray-500 mt-1">Number of recent news items sent as context to Claude</p>
        </div>
        <button className="btn-primary">Save Configuration</button>
      </div>
    </div>
  );
}