import { useWorldCupData } from '../hooks/useWorldCupData';
import GroupSection from './GroupSection';
import Predictor from './Predictor';

export default function Dashboard() {
  const { pointsTable, chances, lastUpdated, loading } = useWorldCupData();

  const allTeamsArray = Object.values(pointsTable);
  const allChancesArray = Object.values(chances);

  const group1 = allTeamsArray.filter((t) => String(t.groupName) === '1');
  const group2 = allTeamsArray.filter((t) => String(t.groupName) === '2');

  const group1Ids = new Set(group1.map((t) => String(t.teamId)));
  const group2Ids = new Set(group2.map((t) => String(t.teamId)));

  const chances1 = allChancesArray.filter((c) => group1Ids.has(String(c.teamId)));
  const chances2 = allChancesArray.filter((c) => group2Ids.has(String(c.teamId)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-bold text-yellow-400">T20 World Cup 2026</h1>
        <p className="text-gray-400 text-sm mt-1">Semi-Finals Predictor</p>
        {lastUpdated && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <GroupSection groupName="1" teams={group1} chances={chances1} />
      <GroupSection groupName="2" teams={group2} chances={chances2} />
      <Predictor allTeams={[...group1, ...group2]} />
    </div>
  );
}
