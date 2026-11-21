// Bot characters. Each has a way of picking a number and a way of choosing the next rule.
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export const BOTS = [
  {
    key: 'techie',
    name: 'Overthinking Techie',
    emoji: '🤓',
    pick: (rule) => (rule.smart ? rule.smart() : rand(1, 10)),
    choose: (options) => options.find((r) => r.type === 'logic') || options[0],
  },
  {
    key: 'chacha',
    name: 'Chaos Chacha',
    emoji: '🤪',
    pick: () => rand(1, 10),
    choose: (options) => options.find((r) => r.type === 'chaos') || options[rand(0, options.length - 1)],
  },
  {
    key: 'cousin',
    name: 'Copycat Cousin',
    emoji: '🦜',
    pick: (rule, ctx) => (ctx.lastWinningPick ? ctx.lastWinningPick : rand(1, 10)),
    choose: (options) => options[0],
  },
  {
    key: 'nani',
    name: 'Nervous Nani',
    emoji: '👵',
    pick: () => rand(1, 3),
    choose: (options) => options[options.length - 1],
  },
];

export function botByKey(key) {
  return BOTS.find((b) => b.key === key) || BOTS[1];
}
