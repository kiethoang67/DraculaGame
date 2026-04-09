// ============================================================
// Constants — Character data, event names shared across client
// ============================================================

export const CHARACTER_NAMES: Record<string, string> = {
  dracula: 'Dracula',
  alucard: 'Alucard',
  trickster: 'Trickster',
  van_helsing: 'Van Helsing',
  ghost: 'Ghost',
  boogie_monster: 'Boogie Monster',
  doctor_jekyll: 'Doctor Jekyll',
  swamp_creature: 'Swamp Creature',
  zombie: 'Zombie',
  witch: 'Witch',
};

export const CHARACTER_ICONS: Record<string, string> = {
  dracula: '🧛',
  alucard: '🦇',
  trickster: '🃏',
  van_helsing: '⚔️',
  ghost: '👻',
  boogie_monster: '👹',
  doctor_jekyll: '🧪',
  swamp_creature: '🐊',
  zombie: '🧟',
  witch: '🧹',
};

export const CHARACTER_IDS = Object.keys(CHARACTER_NAMES);

export const ACTION_NAMES = {
  inquire: 'Inquire',
  dance: 'Dance',
  accuse: 'Accuse',
} as const;
