// Rulebook v3 from the team (115 rules). Data only; the interpreter is shared/rulebook.js.
export default {
 "version": 3,
 "count": 115,
 "categories": {
  "GREED": "Greed Games",
  "ALONE": "Alone or Together",
  "CROWD": "Follow the Crowd",
  "FATE": "Snakes, Dice & Destiny",
  "RAFFLE": "Raffles & Hot Seats",
  "AVG": "Be Average (or Weird)",
  "FAV": "Favourite Numbers",
  "REVENGE": "Revenge & Comebacks",
  "NERVES": "Nerves of Steel",
  "WILD": "Wild Cards",
  "DARE": "Dares & Roasts"
 },
 "rules": [
  {
   "id": "GREED-001",
   "category": "GREED",
   "text": "BRAVE! The highest number wins.",
   "type": "highest",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-002",
   "category": "GREED",
   "text": "SMALL IS BEAUTIFUL! The lowest number wins.",
   "type": "lowest",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-003",
   "category": "GREED",
   "text": "GREED KILLS! Highest wins, but a tie at the top costs both 10.",
   "type": "highest",
   "params": {
    "tie": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-004",
   "category": "GREED",
   "text": "ONE GREEDY GUY! Anyone picks 10? LOWEST wins instead.",
   "type": "highest",
   "params": {
    "flip_if": "any10"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "GREED-005",
   "category": "GREED",
   "text": "ANYONE PICKS 1? Then HIGHEST wins instead. Chaos!",
   "type": "lowest",
   "params": {
    "flip_if": "any1"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "GREED-006",
   "category": "GREED",
   "text": "DON'T BE GREEDY! The SECOND highest number wins.",
   "type": "nth_high",
   "params": {
    "n": 2
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "GREED-007",
   "category": "GREED",
   "text": "SNEAKY! The SECOND lowest number wins.",
   "type": "nth_low",
   "params": {
    "n": 2
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "GREED-008",
   "category": "GREED",
   "text": "TAX RAID! The highest number loses 10.",
   "type": "highest",
   "params": {
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-009",
   "category": "GREED",
   "text": "COWARD TAX! The lowest number loses 10.",
   "type": "lowest",
   "params": {
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-010",
   "category": "GREED",
   "text": "TWO WINNERS! The two highest numbers both win.",
   "type": "highest",
   "params": {
    "count": 2
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-011",
   "category": "GREED",
   "text": "BIGGEST LIE! The highest number nobody else picked wins.",
   "type": "highest_unique",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-012",
   "category": "GREED",
   "text": "AUTO FARE! The lowest number nobody else picked wins.",
   "type": "lowest_unique",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "GREED-013",
   "category": "GREED",
   "text": "JACKPOT AUTO! Lowest unique number wins DOUBLE.",
   "type": "lowest_unique",
   "params": {},
   "effects": [
    "double"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "GREED-014",
   "category": "GREED",
   "text": "BIG LIE OR BUST! Highest unique wins. None? EVERYONE loses 5.",
   "type": "highest_unique",
   "params": {
    "none": "all_minus_5"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-001",
   "category": "ALONE",
   "text": "BE UNIQUE! Alone: +10. Copied someone: -10.",
   "type": "dupes",
   "params": {
    "solo": 10,
    "dup": -10
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-002",
   "category": "ALONE",
   "text": "BEST FRIENDS! Share a number: +10. Alone: -10.",
   "type": "dupes",
   "params": {
    "solo": -10,
    "dup": 10
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-003",
   "category": "ALONE",
   "text": "NO COPYCATS! Duplicates lose 10. Unique picks are safe.",
   "type": "dupes",
   "params": {
    "solo": 0,
    "dup": -10
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-004",
   "category": "ALONE",
   "text": "MIRACLE! All numbers different? Everyone +5. Else duplicates -10.",
   "type": "all_different",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-005",
   "category": "ALONE",
   "text": "MAKE A FRIEND! Exactly TWO sharing a number win. Three is a crowd.",
   "type": "twins",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-006",
   "category": "ALONE",
   "text": "ONE SEAT! Pick 7 alone to win. Share it and you both fall off.",
   "type": "fixed",
   "params": {
    "n": 7,
    "rule": "solo"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-007",
   "category": "ALONE",
   "text": "FIRST CLASS! Only one fits in seat 1. Share it and lose 10.",
   "type": "fixed",
   "params": {
    "n": 1,
    "rule": "solo"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-008",
   "category": "ALONE",
   "text": "TOP FLOOR! Pick 10 alone to win. Crowded? All lose 10.",
   "type": "fixed",
   "params": {
    "n": 10,
    "rule": "solo"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-009",
   "category": "ALONE",
   "text": "SOCIAL DISTANCING! Within 1 of anyone else's number? Lose 5.",
   "type": "adjacent",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "ALONE-010",
   "category": "ALONE",
   "text": "STICK TOGETHER! Within 1 of someone else's number? Win 5.",
   "type": "adjacent",
   "params": {
    "mode": "win"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-001",
   "category": "CROWD",
   "text": "WOLF MOMENT! The number picked by the fewest people wins.",
   "type": "popular",
   "params": {
    "dir": "least"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-002",
   "category": "CROWD",
   "text": "BE A SHEEP! The most popular number wins.",
   "type": "popular",
   "params": {
    "dir": "most"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-003",
   "category": "CROWD",
   "text": "DON'T FOLLOW THE CROWD! The most popular number loses 10.",
   "type": "popular",
   "params": {
    "dir": "most",
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-004",
   "category": "CROWD",
   "text": "ODD ONE OUT! The least popular number loses 10.",
   "type": "popular",
   "params": {
    "dir": "least",
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-005",
   "category": "CROWD",
   "text": "MAJORITY RULES! Over half the room must match. That crowd wins.",
   "type": "popular",
   "params": {
    "dir": "most",
    "min_share": 0.5
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "CROWD-006",
   "category": "CROWD",
   "text": "TEAM ODD vs TEAM EVEN! The bigger team wins 10 each.",
   "type": "parity_vote",
   "params": {
    "win": "majority"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-007",
   "category": "CROWD",
   "text": "TEAM ODD vs TEAM EVEN! The smaller team wins 10 each.",
   "type": "parity_vote",
   "params": {
    "win": "minority"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-008",
   "category": "CROWD",
   "text": "LOW vs HIGH! The smaller side gets the biryani, +10 each.",
   "type": "half_vote",
   "params": {
    "win": "minority"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "CROWD-009",
   "category": "CROWD",
   "text": "LOW (1-5) vs HIGH (6-10)! The bigger side wins 10 each.",
   "type": "half_vote",
   "params": {
    "win": "majority"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-001",
   "category": "FATE",
   "text": "SNAKE ALERT! Pick the snake number: -10. Lowest unique of the rest wins.",
   "type": "cursed",
   "params": {
    "then": "lowest_unique"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-002",
   "category": "FATE",
   "text": "TWO SNAKES! Touch either: -10. Highest of the rest wins.",
   "type": "cursed",
   "params": {
    "count": 2,
    "then": "highest"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-003",
   "category": "FATE",
   "text": "THREE SNAKES! Dodge them all for +5. Get bitten: -10.",
   "type": "cursed",
   "params": {
    "count": 3,
    "then": "none",
    "safe": 5
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-004",
   "category": "FATE",
   "text": "SNAKE ALERT! Pick the snake number and lose 10. Just survive.",
   "type": "cursed",
   "params": {
    "then": "none"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-005",
   "category": "FATE",
   "text": "SNAKE PIT! Bitten: -10. Lowest of the survivors wins DOUBLE.",
   "type": "cursed",
   "params": {
    "then": "lowest"
   },
   "effects": [
    "double"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "FATE-006",
   "category": "FATE",
   "text": "CURSED NUMBER! Pick it: -10 and a dare. Highest survivor wins.",
   "type": "cursed",
   "params": {
    "then": "highest"
   },
   "effects": [
    "dare_cursed"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "FATE-007",
   "category": "FATE",
   "text": "SHAGUN! A lucky number appears. Pick it alone for +15.",
   "type": "lucky",
   "params": {
    "solo": 15,
    "shared": 0
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-008",
   "category": "FATE",
   "text": "LUCKY STAR! Pick it alone: +15. Share it: -5 each.",
   "type": "lucky",
   "params": {
    "solo": 15,
    "shared": -5
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-009",
   "category": "FATE",
   "text": "TWO LUCKY STARS! Pick one alone: +20. Share: -10.",
   "type": "lucky",
   "params": {
    "solo": 20,
    "shared": -10,
    "count": 2
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-010",
   "category": "FATE",
   "text": "RAIN OF LUCK! Three lucky numbers. Pick any for +5.",
   "type": "lucky",
   "params": {
    "solo": 5,
    "shared": 5,
    "count": 3
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-011",
   "category": "FATE",
   "text": "THE UNIVERSE DECIDES! A random number drops after picks. Closest wins.",
   "type": "random_draw",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-012",
   "category": "FATE",
   "text": "BULLSEYE! A random number drops. Hit it exactly for +20.",
   "type": "random_draw",
   "params": {
    "exact": "bonus"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-013",
   "category": "FATE",
   "text": "BULLSEYE ONLY! Exact hit wins. Nobody? Jackpot grows!",
   "type": "random_draw",
   "params": {
    "exact_only": 1
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-014",
   "category": "FATE",
   "text": "DOOM DRAW! A random number drops. Closest to it loses 10.",
   "type": "random_draw",
   "params": {
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-015",
   "category": "FATE",
   "text": "ANTI-LUCK! A random number drops. FURTHEST from it wins.",
   "type": "random_draw",
   "params": {
    "mode": "furthest"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-016",
   "category": "FATE",
   "text": "COIN FLIP after picks! Heads: highest wins. Tails: lowest wins.",
   "type": "coin",
   "params": {
    "heads": "highest",
    "tails": "lowest"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-017",
   "category": "FATE",
   "text": "HEADS you win, TAILS you pay. The highest pick takes the risk.",
   "type": "coin",
   "params": {
    "heads": "highest",
    "tails": "highest_lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-018",
   "category": "FATE",
   "text": "COIN FLIP! Heads: lowest unique wins. Tails: highest unique.",
   "type": "coin",
   "params": {
    "heads": "lowest_unique",
    "tails": "highest_unique"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-019",
   "category": "FATE",
   "text": "DICE OF GLORY! Dice rolls 1 to 6. Whoever picked it wins 10!",
   "type": "dice",
   "params": {
    "mode": "hit"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FATE-020",
   "category": "FATE",
   "text": "DICE OF DOOM! Dice rolls 1 to 6. Whoever picked it loses 10!",
   "type": "dice",
   "params": {
    "mode": "hit_lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "RAFFLE-001",
   "category": "RAFFLE",
   "text": "RAFFLE! Your number is your tickets. One ticket is drawn.",
   "type": "raffle",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "RAFFLE-002",
   "category": "RAFFLE",
   "text": "RAFFLE WITH A CATCH! Your number is your tickets. Duplicates are torn up.",
   "type": "raffle",
   "params": {
    "dupe": "void"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "RAFFLE-003",
   "category": "RAFFLE",
   "text": "CHEAP RAFFLE! Lower number means more tickets. One is drawn.",
   "type": "raffle",
   "params": {
    "invert": 1
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "RAFFLE-004",
   "category": "RAFFLE",
   "text": "DOUBLE RAFFLE! Tickets = your number. Duplicates torn up. Winner gets DOUBLE.",
   "type": "raffle",
   "params": {
    "dupe": "void"
   },
   "effects": [
    "double"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "RAFFLE-005",
   "category": "RAFFLE",
   "text": "HOT SEAT! One random player's number: 6+ wins 10, 5 or less loses 10.",
   "type": "hot_seat",
   "params": {
    "mode": "high"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "RAFFLE-006",
   "category": "RAFFLE",
   "text": "HOT SEAT! One random player's number: odd wins 10, even loses 10.",
   "type": "hot_seat",
   "params": {
    "mode": "parity"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "RAFFLE-007",
   "category": "RAFFLE",
   "text": "HOT SEAT! One random player: alone on their number wins 10, else loses 10.",
   "type": "hot_seat",
   "params": {
    "mode": "unique"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "AVG-001",
   "category": "AVG",
   "text": "BE AVERAGE! Closest to the group average wins.",
   "type": "closest_stat",
   "params": {
    "stat": "avg"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "AVG-002",
   "category": "AVG",
   "text": "BE THE WEIRDEST! Furthest from the average wins.",
   "type": "furthest_stat",
   "params": {
    "stat": "avg"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "AVG-003",
   "category": "AVG",
   "text": "BORING PEOPLE LOSE! Closest to the average loses 10.",
   "type": "closest_stat",
   "params": {
    "stat": "avg",
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "AVG-004",
   "category": "AVG",
   "text": "THE MIDDLE CHILD! Closest to the middle pick wins.",
   "type": "closest_stat",
   "params": {
    "stat": "median"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "AVG-005",
   "category": "AVG",
   "text": "TWO CLOSE FRIENDS! The two closest to the average both win.",
   "type": "closest_stat",
   "params": {
    "stat": "avg",
    "count": 2
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-001",
   "category": "FAV",
   "text": "LUCKY SEVEN! Closest to 7 wins.",
   "type": "closest_to",
   "params": {
    "n": 7
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-002",
   "category": "FAV",
   "text": "FIRST! Closest to 1 wins.",
   "type": "closest_to",
   "params": {
    "n": 1
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-003",
   "category": "FAV",
   "text": "PERFECT TEN! Closest to 10 wins.",
   "type": "closest_to",
   "params": {
    "n": 10
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-004",
   "category": "FAV",
   "text": "SMACK IN THE MIDDLE! Closest to 5 wins.",
   "type": "closest_to",
   "params": {
    "n": 5
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-005",
   "category": "FAV",
   "text": "THREE'S COMPANY! Closest to 3 wins.",
   "type": "closest_to",
   "params": {
    "n": 3
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-006",
   "category": "FAV",
   "text": "CLOUD NINE! Closest to 9 wins.",
   "type": "closest_to",
   "params": {
    "n": 9
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-007",
   "category": "FAV",
   "text": "SIXER! Closest to 6 wins. Cricket fans know.",
   "type": "closest_to",
   "params": {
    "n": 6
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-008",
   "category": "FAV",
   "text": "MAVERICK! Furthest from 5 wins.",
   "type": "furthest_from",
   "params": {
    "n": 5
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-009",
   "category": "FAV",
   "text": "TEAM EVEN ONLY! Only even numbers can win. Highest even wins.",
   "type": "property",
   "params": {
    "prop": "even",
    "pick": "high"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-010",
   "category": "FAV",
   "text": "ODD SQUAD! Only odd numbers can win. Lowest odd wins.",
   "type": "property",
   "params": {
    "prop": "odd",
    "pick": "low"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-011",
   "category": "FAV",
   "text": "PRIME TIME! Prime numbers win: 2, 3, 5 or 7.",
   "type": "property",
   "params": {
    "prop": "prime",
    "pick": "all"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-012",
   "category": "FAV",
   "text": "COMFORT ZONE! Picks of 4, 5, 6 or 7 win.",
   "type": "property",
   "params": {
    "prop": "mid",
    "pick": "all"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "FAV-013",
   "category": "FAV",
   "text": "EDGE LORDS! Picks of 1 or 10 win.",
   "type": "property",
   "params": {
    "prop": "edge",
    "pick": "all"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "REVENGE-001",
   "category": "REVENGE",
   "text": "OFF WITH HIS HEAD! The leader loses 10. Lowest unique of the rest wins.",
   "type": "lowest_unique",
   "params": {
    "exclude": "leader"
   },
   "effects": [
    "leader_minus_10"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-002",
   "category": "REVENGE",
   "text": "ROBIN HOOD! Closest to 5 wins and steals 5 from the leader.",
   "type": "closest_to",
   "params": {
    "n": 5
   },
   "effects": [
    "steal_leader_5"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-003",
   "category": "REVENGE",
   "text": "BULLY! Highest wins and steals 5 from the lowest pick.",
   "type": "highest",
   "params": {},
   "effects": [
    "steal_lowest_pick_5"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-004",
   "category": "REVENGE",
   "text": "DREAM SWAP! Lowest wins and swaps scores with the LEADER.",
   "type": "lowest",
   "params": {},
   "effects": [
    "swap_winner_leader"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "REVENGE-005",
   "category": "REVENGE",
   "text": "CHARITY! Highest wins, then swaps scores with last place.",
   "type": "highest",
   "params": {},
   "effects": [
    "swap_winner_loser"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "REVENGE-006",
   "category": "REVENGE",
   "text": "UNDERDOGS ONLY! Bottom half of the scoreboard can win. Lowest unique.",
   "type": "lowest_unique",
   "params": {
    "only": "bottom_half"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "REVENGE-007",
   "category": "REVENGE",
   "text": "COMEBACK! Bottom half only: highest unique wins. Last place +5.",
   "type": "highest_unique",
   "params": {
    "only": "bottom_half"
   },
   "effects": [
    "bottom_plus_5"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-008",
   "category": "REVENGE",
   "text": "WEALTH TAX! Closest to average wins. The leader pays 5 to last place.",
   "type": "closest_stat",
   "params": {
    "stat": "avg"
   },
   "effects": [
    "leader_pays_last"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "REVENGE-009",
   "category": "REVENGE",
   "text": "MOB JUSTICE! The most popular number wins. The leader loses 10.",
   "type": "popular",
   "params": {
    "dir": "most"
   },
   "effects": [
    "leader_minus_10"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-010",
   "category": "REVENGE",
   "text": "TAXI! Closest to 1 wins. Everyone else pays 2.",
   "type": "closest_to",
   "params": {
    "n": 1
   },
   "effects": [
    "others_minus_2"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-011",
   "category": "REVENGE",
   "text": "TOP FLOOR! Closest to 10 wins. Everyone else loses 2.",
   "type": "closest_to",
   "params": {
    "n": 10
   },
   "effects": [
    "others_minus_2"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-012",
   "category": "REVENGE",
   "text": "HEAVY CROWN! Highest loses 10. Last place gets +5.",
   "type": "highest",
   "params": {
    "mode": "lose"
   },
   "effects": [
    "bottom_plus_5"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "REVENGE-013",
   "category": "REVENGE",
   "text": "KING SITS OUT! Highest of the rest steals 5 from the leader.",
   "type": "highest",
   "params": {
    "exclude": "leader"
   },
   "effects": [
    "steal_leader_5"
   ],
   "minPlayers": 2,
   "skipRound1": true,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "NERVES-001",
   "category": "NERVES",
   "text": "FASTEST FINGER! First to lock in wins.",
   "type": "speed",
   "params": {
    "mode": "first"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "NERVES-002",
   "category": "NERVES",
   "text": "NERVES OF STEEL! Last to lock in wins.",
   "type": "speed",
   "params": {
    "mode": "last"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "NERVES-003",
   "category": "NERVES",
   "text": "PATIENCE! First to lock in loses 10.",
   "type": "speed",
   "params": {
    "mode": "first",
    "outcome": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "NERVES-004",
   "category": "NERVES",
   "text": "TIME'S UP! Last to lock in loses 10.",
   "type": "speed",
   "params": {
    "mode": "last",
    "outcome": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "WILD-001",
   "category": "WILD",
   "text": "SURPRISE! Pick blind. The rule is revealed after you lock in.",
   "type": "mystery",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "WILD-002",
   "category": "WILD",
   "text": "DOUBLE SURPRISE! Hidden rule. The winner gets DOUBLE.",
   "type": "mystery",
   "params": {},
   "effects": [
    "double"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "WILD-003",
   "category": "WILD",
   "text": "MAUJ ROUND! No points. The commentator roasts everyone.",
   "type": "no_points",
   "params": {},
   "effects": [
    "roast_all"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "WILD-004",
   "category": "WILD",
   "text": "FREEZE! Nobody scores. The jackpot DOUBLES.",
   "type": "no_points",
   "params": {},
   "effects": [
    "jackpot_x2"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 3
  },
  {
   "id": "WILD-005",
   "category": "WILD",
   "text": "SCORE SHUFFLE! Scores are randomly reassigned. Pray.",
   "type": "shuffle_scores",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "rare",
   "tier": 3
  },
  {
   "id": "WILD-006",
   "category": "WILD",
   "text": "SWAP! Two random players swap scores. Hope it's not you.",
   "type": "swap_two",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "rare",
   "tier": 3
  },
  {
   "id": "WILD-007",
   "category": "WILD",
   "text": "REVOLUTION! Leader becomes last. Last becomes leader.",
   "type": "reverse_board",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "rare",
   "tier": 3
  },
  {
   "id": "WILD-008",
   "category": "WILD",
   "text": "JACKPOT ROUND! Lowest unique wins the pot, doubled.",
   "type": "lowest_unique",
   "params": {},
   "effects": [
    "jackpot_x2"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "rare",
   "tier": 3
  },
  {
   "id": "WILD-009",
   "category": "WILD",
   "text": "LUCKY SEVEN ROUND! Closest to 7 wins DOUBLE.",
   "type": "closest_to",
   "params": {
    "n": 7
   },
   "effects": [
    "double"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "rare",
   "tier": 3
  },
  {
   "id": "WILD-010",
   "category": "WILD",
   "text": "WOLF PACK! The least popular number wins DOUBLE.",
   "type": "popular",
   "params": {
    "dir": "least"
   },
   "effects": [
    "double"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "rare",
   "tier": 3
  },
  {
   "id": "DARE-001",
   "category": "DARE",
   "text": "MOVIE TIME! Lowest wins. Highest does a filmy hero entry.",
   "type": "lowest",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-002",
   "category": "DARE",
   "text": "POTATO! Closest to 5 wins. Everyone who picked EVEN says \"I'm a potato.\"",
   "type": "closest_to",
   "params": {
    "n": 5
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-003",
   "category": "DARE",
   "text": "CHAMPION! Lowest unique wins. Duplicates must crow like a rooster.",
   "type": "lowest_unique",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-004",
   "category": "DARE",
   "text": "JAI HO! Most popular number wins. The crowd shouts \"JAI HO!\"",
   "type": "popular",
   "params": {
    "dir": "most"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-005",
   "category": "DARE",
   "text": "COMMENTATOR! Highest loses 10 and commentates the next reveal.",
   "type": "highest",
   "params": {
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-006",
   "category": "DARE",
   "text": "DARE MASTER! Highest wins and dares anyone in the room.",
   "type": "highest",
   "params": {},
   "effects": [
    "dare_winner"
   ],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "DARE-007",
   "category": "DARE",
   "text": "FRIENDSHIP! Pick 7 alone to win. Share a 7? Compliment each other.",
   "type": "fixed",
   "params": {
    "n": 7,
    "rule": "solo"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-008",
   "category": "DARE",
   "text": "TEAMWORK! All within 3? Everyone wins and shouts \"TEAMWORK!\"",
   "type": "spread",
   "params": {
    "k": 3,
    "fallback": "lowest"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 2
  },
  {
   "id": "DARE-009",
   "category": "DARE",
   "text": "SPEECH! Highest unique wins and gives a 5-second victory speech.",
   "type": "highest_unique",
   "params": {},
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  },
  {
   "id": "DARE-010",
   "category": "DARE",
   "text": "SORRY! Lowest loses 10 and apologises to the room, dramatically.",
   "type": "lowest",
   "params": {
    "mode": "lose"
   },
   "effects": [],
   "minPlayers": 2,
   "skipRound1": false,
   "rarity": "common",
   "tier": 1
  }
 ],
 "tierNote": "Tier 1 = simplest rules, drawn in rounds 1-3 so a stranger learns fast. Rounds 4-7 draw tier 1-2. Rounds 8-10 draw any tier.",
 "engineNotes": {
  "raffle": "Each player's pick = number of tickets (invert=1: 11 minus pick). dupe=void: players who share a number have those tickets removed. Server draws one ticket, owner wins +10. No tickets left = jackpot grows.",
  "hot_seat": "Server picks one random player. mode=high: pick 6+ = +10, 5 or less = -10. mode=parity: odd +10, even -10. mode=unique: unique +10, shared -10. Others unaffected.",
  "property edge": "prop=edge means a pick of 1 or 10. Everything else uses the earlier RULEBOOK.md spec.",
  "removed": "Race rounds and chaos modifiers are parked, not part of this rulebook."
 }
};
