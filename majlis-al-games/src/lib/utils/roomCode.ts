export function generateRoomCode(): string {
  const prefix = 'MJL';
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = prefix + '-';
  
  for (let i = 0; i < 3; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return code;
}

const usedCodes = new Set<string>();

export function generateUniqueRoomCode(maxAttempts = 100): string {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateRoomCode();
    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      return code;
    }
  }
  throw new Error('Failed to generate unique room code');
}

export function validateRoomCode(code: string): boolean {
  const pattern = /^MJL-[0-9A-Z]{3}$/;
  return pattern.test(code);
}
