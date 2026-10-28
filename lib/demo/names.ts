/** Demo friends are known by name ("AYOP") and their trees by nickname ("ayop"). */
const SPECIAL: Record<string, string> = { ayop: 'AYOP' };

export const demoNick = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');

export const demoName = (nick: string) => SPECIAL[nick] ?? nick.charAt(0).toUpperCase() + nick.slice(1);
