import { getTeamCode, getTeamFlagUrl } from '../utils/teamDisplay';

export default function GroupSection({ groupName, teams, chances }) {
  const getChance = (teamId) => {
    const c = chances.find((chance) => String(chance.teamId) === String(teamId));
    return c ? Number(c.qualifyPercentage || 0) : 0;
  };

  const getStatus = (teamId) => {
    const c = chances.find((chance) => String(chance.teamId) === String(teamId));
    return c ? c.status : 'IN_CONTENTION';
  };

  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  const getBarColor = (pct) => {
    if (pct >= 70) return 'bg-green-500';
    if (pct >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    if (status === 'QUALIFIED') {
      return <span className="bg-green-600 text-xs px-2 py-0.5 rounded-full">Qualified</span>;
    }
    if (status === 'ELIMINATED') {
      return <span className="bg-red-700 text-xs px-2 py-0.5 rounded-full">Eliminated</span>;
    }
    return <span className="bg-yellow-700 text-xs px-2 py-0.5 rounded-full">In Contention</span>;
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
      <h2 className="text-lg font-bold mb-4 text-gray-300">GROUP {groupName} - Qualification Chances</h2>

      {sorted.map((team, index) => {
        const pct = getChance(team.teamId);
        const status = getStatus(team.teamId);

        return (
          <div key={team.teamId} className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">#{index + 1}</span>
                <div className="flex items-center gap-2">
  {getTeamFlagUrl(team) && (
    <img
      src={getTeamFlagUrl(team)}
      alt={getTeamCode(team)}
      className="w-7 h-5 object-cover rounded-sm shadow"
    />
  )}
  <span className="font-semibold">{getTeamCode(team)}</span>
</div>
                {getStatusBadge(status)}
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400">
                  {team.points} pts | NRR: {Number(team.nrr).toFixed(3)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${getBarColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-bold w-12 text-right">{pct.toFixed(1)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
