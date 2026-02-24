const TEAM_META_BY_CODE = {
  IND: { code: 'IND', flag: 'IN' },
  SA: { code: 'SA', flag: 'ZA' },
  ENG: { code: 'ENG', flag: 'GB' },
  WI: { code: 'WI', flag: '' },
  ZIM: { code: 'ZIM', flag: 'ZW' },
  AUS: { code: 'AUS', flag: 'AU' },
  NZ: { code: 'NZ', flag: 'NZ' },
  PAK: { code: 'PAK', flag: 'PK' },
  SL: { code: 'SL', flag: 'LK' },
  BAN: { code: 'BAN', flag: 'BD' },
  AFG: { code: 'AFG', flag: 'AF' },
  IRE: { code: 'IRE', flag: 'IE' },
  USA: { code: 'USA', flag: 'US' },
  CAN: { code: 'CAN', flag: 'CA' },
  NED: { code: 'NED', flag: 'NL' },
  SCO: { code: 'SCO', flag: 'GB' },
  NEP: { code: 'NEP', flag: 'NP' },
  UAE: { code: 'UAE', flag: 'AE' },
  OMAN: { code: 'OMAN', flag: 'OM' },
  NAM: { code: 'NAM', flag: 'NA' },
  PNG: { code: 'PNG', flag: 'PG' },
};

const TEAM_CODE_BY_NAME = {
  india: 'IND',
  'west indies': 'WI',
  'south africa': 'SA',
  zimbabwe: 'ZIM',
  england: 'ENG',
  australia: 'AUS',
  'new zealand': 'NZ',
  pakistan: 'PAK',
  'sri lanka': 'SL',
  bangladesh: 'BAN',
  afghanistan: 'AFG',
  ireland: 'IRE',
  usa: 'USA',
  canada: 'CAN',
  netherlands: 'NED',
  scotland: 'SCO',
  nepal: 'NEP',
  'united arab emirates': 'UAE',
  oman: 'OMAN',
  namibia: 'NAM',
  'papua new guinea': 'PNG',
};

const toFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '';
  const base = 127397;
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(base + char.charCodeAt(0)))
    .join('');
};
export const getTeamFlagUrl = (team) => {
  const code = getTeamCode(team);
  const mapped = TEAM_META_BY_CODE[code];
  if (!mapped?.flag) return null;
  return `https://flagcdn.com/w40/${mapped.flag.toLowerCase()}.png`;
};

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const extractRawName = (team) =>
  team?.teamName || team?.name || team?.country || team?.team || '';

const looksLikeCode = (value) => /^[A-Za-z]{2,4}$/.test(String(value || '').trim());

export const getTeamCode = (team) => {
  const directCandidates = [
    team?.shortCode,
    team?.teamCode,
    team?.code,
    team?.teamShortName,
    team?.shortName,
  ];

  for (const candidate of directCandidates) {
    if (!candidate) continue;
    const normalized = String(candidate).trim().toUpperCase();
    if (TEAM_META_BY_CODE[normalized]) return normalized;
    if (looksLikeCode(normalized)) return normalized;
  }

  const rawName = String(extractRawName(team));
  const name = normalize(rawName);

  const startsWithCode = rawName.match(/^([A-Za-z]{2,4})\b/);
  if (startsWithCode) {
    const candidate = startsWithCode[1].toUpperCase();
    if (TEAM_META_BY_CODE[candidate]) return candidate;
  }

  for (const [fullName, code] of Object.entries(TEAM_CODE_BY_NAME)) {
    if (name.includes(fullName)) return code;
  }

  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.slice(0, 3).map((part) => part[0]).join('').toUpperCase();
};

export const getTeamFlag = (team) => {
  const code = getTeamCode(team);
  const mapped = TEAM_META_BY_CODE[code];

  // Always prefer deterministic country-code-derived emoji flags.
  if (mapped?.flag) return toFlagEmoji(mapped.flag);

  // Fallback only when code is unknown and backend already gave a true emoji.
  const provided = String(team?.flagEmoji || '').trim();
  if (provided && !/^[A-Za-z0-9 _-]+$/.test(provided)) return provided;

  return '';
};

export const formatTeamLabel = (team) => {
  const code = getTeamCode(team);
  const flag = getTeamFlag(team);
  return flag ? `${code} ${flag}` : code;
};
