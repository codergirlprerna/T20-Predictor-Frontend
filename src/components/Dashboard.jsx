import { useWorldCupData } from '../hooks/useWorldCupData';
import GroupSection from './GroupSection';
import Predictor from './Predictor';

export default function Dashboard() {
  const { pointsTable, chances, lastUpdated, loading } = useWorldCupData();

  const allTeamsArray = Object.values(pointsTable);
  const allChancesArray = Object.values(chances);

  const group1 = allTeamsArray.filter(t => String(t.groupName) === '1');
  const group2 = allTeamsArray.filter(t => String(t.groupName) === '2');

  const group1Ids = group1.map(t => Number(t.teamId));
  const group2Ids = group2.map(t => Number(t.teamId));

  const chances1 = allChancesArray.filter(c => group1Ids.includes(Number(c.teamId)));
  const chances2 = allChancesArray.filter(c => group2Ids.includes(Number(c.teamId)));

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <p className="text-2xl animate-pulse text-white">🏏 Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-3 py-4">

        {/* Header */}
        <div className="text-center mb-6 mt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">
            🏆 T20 World Cup 2026
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Semi-Finals Predictor
          </p>
          {lastUpdated && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <GroupSection groupName="1" teams={group1} chances={chances1} />
        <GroupSection groupName="2" teams={group2} chances={chances2} />
        <Predictor allTeams={allTeamsArray} />

      </div>
    </div>
  );
}