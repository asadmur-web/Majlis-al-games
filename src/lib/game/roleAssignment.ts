export type PlayerRole = 'citizen' | 'traitor';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role?: PlayerRole;
  score: number;
  isTraitor: boolean;
}

export function calculateTraitorCount(playerCount: number): number {
  if (playerCount < 4) return 1; // Minimum requirement
  if (playerCount <= 5) return 1;
  if (playerCount <= 8) return 2;
  return 3; // 9 to 12 players
}

export function assignRoles(
  players: Player[],
  previousTraitorIds: string[] = []
): Player[] {
  const playerIds = players.map(p => p.id);
  const traitorCount = calculateTraitorCount(players.length);

  // Prevent same player from being traitor more than 2 consecutive games
  const eligibleIds = playerIds.filter(id =>
    !previousTraitorIds.includes(id) ||
    previousTraitorIds.filter(pid => pid === id).length < 2
  );

  const selectionPool = eligibleIds.length >= traitorCount
    ? eligibleIds
    : playerIds;

  // Shuffle and select traitors
  const shuffled = [...selectionPool].sort(() => Math.random() - 0.5);
  const traitorIds = new Set<string>();

  while (traitorIds.size < traitorCount && shuffled.length > 0) {
    const candidate = shuffled[Math.floor(Math.random() * shuffled.length)];
    traitorIds.add(candidate);
    shuffled.splice(shuffled.indexOf(candidate), 1);
  }

  // Assign roles
  return players.map(player => ({
    ...player,
    role: traitorIds.has(player.id) ? 'traitor' : 'citizen',
    isTraitor: traitorIds.has(player.id),
  }));
}

export function validateRoleDistribution(players: Player[]): boolean {
  const traitorCount = players.filter(p => p.isTraitor).length;
  const expectedCount = calculateTraitorCount(players.length);
  return traitorCount === expectedCount;
}
