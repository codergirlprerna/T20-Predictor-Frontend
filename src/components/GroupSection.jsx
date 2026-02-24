import { getTeamCode, getTeamFlagUrl } from '../utils/teamDisplay';

export default function GroupSection({ groupName, teams, chances }) {

  const getChance = (teamId) => {
    const c = chances.find(c => Number(c.teamId) === Number(teamId));
    return c ? c.qualifyPercentage : 0;
  };

  const getStatus = (teamId) => {
    const c = chances.find(c => Number(c.teamId) === Number(teamId));
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
    if (status === 'QUALIFIED') return (
      <span className="bg-green-600 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
        ✅ Qualified
      </span>
    );
    if (status === 'ELIMINATED') return (
      <span className="bg-red-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
        ❌ Eliminated
      </span>
    );
    return (
      <span className="bg-yellow-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
        ⚡ In Contention
      </span>
    );
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
      <h2 className="text-sm sm:text-base font-bold mb-4 text-gray-300 tracking-wide">
        GROUP {groupName} — Qualification Chances
      </h2>

      {sorted.map((team, index) => {
        const pct = getChance(team.teamId);
        const status = getStatus(team.teamId);

        return (
          <div key={team.teamId} className="mb-4">

            {/* Team info row */}
            <div className="flex justify-between items-center mb-1 gap-2">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <span className="text-gray-500 text-xs">#{index + 1}</span>
                <span className="text-base sm:text-lg">{team.flagEmoji}</span>
                <span className="font-semibold text-sm sm:text-base truncate">
                  {team.shortName}
                </span>
                {getStatusBadge(status)}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-gray-400">
                  {team.points}pts
                </span>
                <span className="text-xs text-gray-500 ml-1 hidden sm:inline">
                  | NRR: {Number(team.nrr).toFixed(3)}
                </span>
              </div>
            </div>

            {/* NRR on mobile - separate line */}
            <div className="sm:hidden text-xs text-gray-500 mb-1">
              NRR: {Number(team.nrr).toFixed(3)}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${getBarColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-bold w-10 text-right shrink-0">
                {pct.toFixed(1)}%
              </span>
            </div>

          </div>
        );
      })}
    </div>
  );
}