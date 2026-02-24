import { useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/firebase';

export default function Predictor({ allTeams }) {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [winnerId, setWinnerId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sameTeam = team1Id && team2Id && String(team1Id) === String(team2Id);

  // ─── Run simulation in frontend using Firebase data ───────
  const handlePredict = async () => {
    if (!team1Id || !team2Id || !winnerId || sameTeam) return;
    setLoading(true);
    setResult(null);

    try {
      // Get all data from Firebase
      const snapshot = await get(ref(db, 'worldcup'));
      const data = snapshot.val();

      if (!data) {
        alert('No data available');
        setLoading(false);
        return;
      }

      const pointsTable = Object.values(data.pointsTable || {});
      const chances = Object.values(data.qualificationChances || {});
      const upcomingMatches = Object.values(data.upcomingMatches || {});

      // Find group of selected teams
      const team1Data = pointsTable.find(t => String(t.teamId) === String(team1Id));
      if (!team1Data) {
        alert('Team data not found');
        setLoading(false);
        return;
      }
      const groupName = String(team1Data.groupName);

      // Filter group teams and matches
      const groupTable = pointsTable.filter(t => String(t.groupName) === groupName);
      const groupMatches = upcomingMatches.filter(m =>
        String(m.team1GroupName) === groupName ||
        String(m.team2GroupName) === groupName
      );

      // Exclude the predicted match
      const remaining = groupMatches.filter(m => !(
        (String(m.team1Id) === String(team1Id) && String(m.team2Id) === String(team2Id)) ||
        (String(m.team1Id) === String(team2Id) && String(m.team2Id) === String(team1Id))
      ));

      // Get before chances
      const before = {};
      chances.forEach(c => { before[String(c.teamId)] = c.qualifyPercentage; });

      // Force winner points
      const forcedPoints = {};
      const forcedNRR = {};
      groupTable.forEach(t => {
        forcedPoints[String(t.teamId)] = t.points;
        forcedNRR[String(t.teamId)] = t.nrr;
      });
      forcedPoints[String(winnerId)] = (forcedPoints[String(winnerId)] || 0) + 2;

      // Simulate all remaining match outcomes
      const n = remaining.length;
      const total = Math.pow(2, n);
      const qualifyCount = {};
      groupTable.forEach(t => { qualifyCount[String(t.teamId)] = 0; });

      for (let mask = 0; mask < total; mask++) {
        const tempPoints = { ...forcedPoints };

        for (let i = 0; i < n; i++) {
          const m = remaining[i];
          if ((mask >> i & 1) === 0) {
            tempPoints[String(m.team1Id)] = (tempPoints[String(m.team1Id)] || 0) + 2;
          } else {
            tempPoints[String(m.team2Id)] = (tempPoints[String(m.team2Id)] || 0) + 2;
          }
        }

        // Get top 2 by points then NRR
        const sorted = Object.entries(tempPoints).sort((a, b) => {
          const ptsDiff = b[1] - a[1];
          if (ptsDiff !== 0) return ptsDiff;
          return (forcedNRR[b[0]] || 0) - (forcedNRR[a[0]] || 0);
        });

        const top2 = sorted.slice(0, 2).map(e => e[0]);
        top2.forEach(id => {
          qualifyCount[id] = (qualifyCount[id] || 0) + 1;
        });
      }

      // Calculate after percentages
      const after = {};
      Object.entries(qualifyCount).forEach(([id, count]) => {
        after[id] = (count * 100.0) / total;
      });

      // Build result
      const loserId = String(winnerId) === String(team1Id) ?
        String(team2Id) : String(team1Id);

      const winnerTeam = allTeams.find(t => String(t.teamId) === String(winnerId));
      const loserTeam = allTeams.find(t => String(t.teamId) === String(loserId));

      const rippleEffects = [];
      groupTable.forEach(t => {
        const id = String(t.teamId);
        if (id === String(winnerId) || id === String(loserId)) return;
        const b = before[id] || 0;
        const a = after[id] || 0;
        const change = a - b;
        if (Math.abs(change) > 0.5) {
          const team = allTeams.find(tm => String(tm.teamId) === id);
          rippleEffects.push({
            teamName: team?.teamName || t.teamName,
            flagEmoji: team?.flagEmoji || '',
            beforeChance: b,
            afterChance: a,
            change: change,
            direction: change > 0 ? 'UP' : 'DOWN'
          });
        }
      });

      setResult({
        winner: {
          teamName: winnerTeam?.teamName,
          flagEmoji: winnerTeam?.flagEmoji,
          beforeChance: before[String(winnerId)] || 0,
          afterChance: after[String(winnerId)] || 0,
          change: (after[String(winnerId)] || 0) - (before[String(winnerId)] || 0)
        },
        loser: {
          teamName: loserTeam?.teamName,
          flagEmoji: loserTeam?.flagEmoji,
          beforeChance: before[String(loserId)] || 0,
          afterChance: after[String(loserId)] || 0,
          change: (after[String(loserId)] || 0) - (before[String(loserId)] || 0)
        },
        rippleEffects
      });

    } catch (e) {
      console.error(e);
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  const fmt = (v) => Number.isFinite(Number(v)) ? Number(v).toFixed(1) : '0.0';

  const getArrow = (direction, change) => {
    const n = Math.abs(Number(change));
    const f = Number.isFinite(n) ? n.toFixed(1) : '0.0';
    return direction === 'UP' ? `+${f}%` : `-${f}%`;
  };

  const isSameId = (a, b) => String(a) === String(b);

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
      <h2 className="text-lg font-bold mb-1 text-gray-300">🔮 Match Predictor</h2>
      <p className="text-gray-500 text-sm mb-4">
        See how a match result changes qualification chances
      </p>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Team 1</label>
          <select
              className="w-full bg-gray-800 rounded-lg p-2 text-sm text-white border border-gray-700"
            value={team1Id}
            onChange={(e) => { setTeam1Id(e.target.value); setWinnerId(''); setResult(null); }}
          >
            <option value="">Select...</option>
            {allTeams.map((t) => (
              <option key={t.teamId} value={t.teamId}>
                {t.flagEmoji} {t.teamName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Team 2</label>
          <select
            className="w-full bg-gray-800 rounded-lg p-2 text-sm text-white"
            value={team2Id}
            onChange={(e) => { setTeam2Id(e.target.value); setWinnerId(''); setResult(null); }}
          >
            <option value="">Select...</option>
            {allTeams
              .filter((t) => !isSameId(t.teamId, team1Id))
              .map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {t.flagEmoji} {t.teamName}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Winner</label>
          <select
            className="w-full bg-gray-800 rounded-lg p-2 text-sm text-white"
            value={winnerId}
            onChange={(e) => { setWinnerId(e.target.value); setResult(null); }}
          >
            <option value="">Select...</option>
            {[team1Id, team2Id].filter(Boolean).map((id) => {
              const t = allTeams.find((team) => isSameId(team.teamId, id));
              return t ? (
                <option key={t.teamId} value={t.teamId}>
                  {t.flagEmoji} {t.teamName}
                </option>
              ) : null;
            })}
          </select>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !team1Id || !team2Id || !winnerId || sameTeam}
        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700
                   text-black font-bold py-2 rounded-lg transition-all"
      >
        {loading ? '⏳ Calculating...' : '⚡ Calculate Impact'}
      </button>

      {result && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-gray-400 font-semibold">Impact:</p>

          <div className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
            <span className="font-semibold">
              {result.winner?.flagEmoji} {result.winner?.teamName}
            </span>
            <div className="text-right">
              <span className="text-gray-400 text-sm">{fmt(result.winner?.beforeChance)}%</span>
              <span className="text-gray-500 mx-2">→</span>
              <span className="text-green-400 font-bold">{fmt(result.winner?.afterChance)}%</span>
              <span className="ml-2 text-green-400 text-sm">
                {getArrow('UP', result.winner?.change)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
            <span className="font-semibold">
              {result.loser?.flagEmoji} {result.loser?.teamName}
            </span>
            <div className="text-right">
              <span className="text-gray-400 text-sm">{fmt(result.loser?.beforeChance)}%</span>
              <span className="text-gray-500 mx-2">→</span>
              <span className="text-red-400 font-bold">{fmt(result.loser?.afterChance)}%</span>
              <span className="ml-2 text-red-400 text-sm">
                {getArrow('DOWN', result.loser?.change)}
              </span>
            </div>
          </div>

          {result.rippleEffects?.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mt-2">Ripple effects:</p>
              {result.rippleEffects.map((r, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-3 flex justify-between items-center">
                  <span className="font-semibold text-sm">
                    {r.flagEmoji} {r.teamName}
                  </span>
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