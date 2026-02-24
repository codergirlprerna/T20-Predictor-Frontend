import { useState } from 'react';
import axios from 'axios';
import { formatTeamLabel } from '../utils/teamDisplay';

export default function Predictor({ allTeams }) {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [winnerId, setWinnerId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sameTeam = team1Id && team2Id && String(team1Id) === String(team2Id);

  const handlePredict = async () => {
    if (!team1Id || !team2Id || !winnerId || sameTeam) return;

    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const res = await axios.get(
    `${BASE_URL}/api/predict?team1Id=${team1Id}&team2Id=${team2Id}&winnerId=${winnerId}`
);
      setResult(res.data);
    } catch (e) {
    setResult(null);
    alert('⏳ Predictor is coming soon! Our backend is being deployed. Please check back shortly.');

    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : '0.0';
  };

  const getArrow = (direction, change) => {
    const n = Number(change);
    const formatted = Number.isFinite(n) ? Math.abs(n).toFixed(1) : '0.0';
    if (direction === 'UP') return `+${formatted}%`;
    return `-${formatted}%`;
  };

  const isSameId = (a, b) => String(a) === String(b);

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
      <h2 className="text-lg font-bold mb-4 text-gray-300">Match Predictor</h2>
      <p className="text-gray-500 text-sm mb-4">
        See how a match result changes each team's qualification chances
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Team 1</label>
          <select
            className="w-full bg-gray-800 rounded-lg p-2 text-sm"
            value={team1Id}
            onChange={(e) => {
              setTeam1Id(e.target.value);
              setWinnerId('');
            }}
          >
            <option value="">Select...</option>
            {allTeams.map((t) => (
              <option key={t.teamId} value={t.teamId}>
                {formatTeamLabel(t)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Team 2</label>
          <select
            className="w-full bg-gray-800 rounded-lg p-2 text-sm"
            value={team2Id}
            onChange={(e) => {
              setTeam2Id(e.target.value);
              setWinnerId('');
            }}
          >
            <option value="">Select...</option>
            {allTeams
              .filter((t) => !isSameId(t.teamId, team1Id))
              .map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {formatTeamLabel(t)}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Winner</label>
          <select
            className="w-full bg-gray-800 rounded-lg p-2 text-sm"
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
          >
            <option value="">Select...</option>
            {[team1Id, team2Id].filter(Boolean).map((id) => {
              const t = allTeams.find((team) => isSameId(team.teamId, id));
              return t ? (
                <option key={t.teamId} value={t.teamId}>
                  {formatTeamLabel(t)}
                </option>
              ) : null;
            })}
          </select>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !team1Id || !team2Id || !winnerId || sameTeam}
        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-2 rounded-lg transition-all"
      >
        {loading ? 'Calculating...' : 'Calculate Impact'}
      </button>

      {result && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-gray-400 font-semibold">Impact:</p>

          <div className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
            <span className="font-semibold">{formatTeamLabel(result.winner || {})}</span>
            <div className="text-right">
              <span className="text-gray-400 text-sm">{formatPercent(result.winner?.beforeChance)}%</span>
              <span className="text-gray-500 mx-2">-&gt;</span>
              <span className="text-green-400 font-bold">{formatPercent(result.winner?.afterChance)}%</span>
              <span className="ml-2 text-green-400 text-sm">{getArrow('UP', result.winner?.change)}</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
            <span className="font-semibold">{formatTeamLabel(result.loser || {})}</span>
            <div className="text-right">
              <span className="text-gray-400 text-sm">{formatPercent(result.loser?.beforeChance)}%</span>
              <span className="text-gray-500 mx-2">-&gt;</span>
              <span className="text-red-400 font-bold">{formatPercent(result.loser?.afterChance)}%</span>
              <span className="ml-2 text-red-400 text-sm">{getArrow('DOWN', result.loser?.change)}</span>
            </div>
          </div>

          {result.rippleEffects?.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mt-2">Ripple effects on other teams:</p>
              {result.rippleEffects.map((r, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
                  <span className="font-semibold text-sm">{formatTeamLabel(r)}</span>
                  <span className={`text-sm font-bold ${r.direction === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                    {getArrow(r.direction, r.change)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
