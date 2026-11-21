// Hand-picked cards from the team's 500-card rulebook: the clearest 1-3 per family, no near-duplicates.
// Data only; interpreted by shared/rulebook.js.
export default [
 {
  "id": "rr-001",
  "category": "Plot Twist",
  "family": "number-switch",
  "text": "Anyone picks 1? Highest wins. Otherwise lowest wins.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 1,
    "atLeast": 1
   },
   "then": {
    "filter": {
     "op": "all"
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "all"
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 1
 },
 {
  "id": "rr-021",
  "category": "Plot Twist",
  "family": "number-switch",
  "text": "Anyone picks 6? Highest wins. Otherwise lowest wins.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 6,
    "atLeast": 1
   },
   "then": {
    "filter": {
     "op": "all"
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "all"
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 1
 },
 {
  "id": "rr-040",
  "category": "Plot Twist",
  "family": "number-switch",
  "text": "Anyone picks 10? Lowest unique wins. Otherwise highest unique wins.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 10,
    "atLeast": 1
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 1
 },
 {
  "id": "rr-041",
  "category": "Plot Twist",
  "family": "collision-switch",
  "text": "Two or more pick 1? Highest wins. Otherwise lowest wins.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 1,
    "atLeast": 2
   },
   "then": {
    "filter": {
     "op": "all"
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "all"
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-061",
  "category": "Plot Twist",
  "family": "collision-switch",
  "text": "Two or more pick 6? Highest wins. Otherwise lowest wins.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 6,
    "atLeast": 2
   },
   "then": {
    "filter": {
     "op": "all"
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "all"
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-080",
  "category": "Plot Twist",
  "family": "collision-switch",
  "text": "Two or more pick 10? Lowest unique wins. Otherwise highest unique wins.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 10,
    "atLeast": 2
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-081",
  "category": "Plot Twist",
  "family": "sum-switch",
  "text": "Two players add to 3? Highest unique wins. Otherwise lowest unique wins.",
  "logic": {
   "condition": {
    "op": "pairSum",
    "value": 3
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-098",
  "category": "Plot Twist",
  "family": "sum-switch",
  "text": "Two players add to 11? Lowest unique wins. Otherwise highest unique wins.",
  "logic": {
   "condition": {
    "op": "pairSum",
    "value": 11
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-115",
  "category": "Plot Twist",
  "family": "gap-switch",
  "text": "Two picks are 1 apart? Highest unique wins. Otherwise lowest unique wins.",
  "logic": {
   "condition": {
    "op": "pairGap",
    "value": 1
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-124",
  "category": "Plot Twist",
  "family": "gap-switch",
  "text": "Two picks are 5 apart? Lowest unique wins. Otherwise highest unique wins.",
  "logic": {
   "condition": {
    "op": "pairGap",
    "value": 5
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-133",
  "category": "Plot Twist",
  "family": "parity-switch",
  "text": "Total of all picks is odd? Highest wins. Otherwise lowest wins.",
  "logic": {
   "condition": {
    "op": "sumOdd"
   },
   "then": {
    "filter": {
     "op": "all"
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "all"
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-134",
  "category": "Plot Twist",
  "family": "any-match-switch",
  "text": "Any numbers match? Highest wins. Otherwise lowest wins.",
  "logic": {
   "condition": {
    "op": "duplicate"
   },
   "then": {
    "filter": {
     "op": "all"
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "all"
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-151",
  "category": "Plot Twist",
  "family": "variety-switch",
  "text": "At least 4 different numbers? Highest unique wins. Otherwise lowest unique wins.",
  "logic": {
   "condition": {
    "op": "distinctAtLeast",
    "value": 4
   },
   "then": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": []
   }
  },
  "tier": 2
 },
 {
  "id": "rr-161",
  "category": "Neighbours",
  "family": "step-neighbour",
  "text": "Pick exactly 1 above someone. Of those, the highest pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "offset",
      "value": -1
     },
     {
      "op": "all"
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 1
 },
 {
  "id": "rr-197",
  "category": "Neighbours",
  "family": "step-neighbour",
  "text": "Pick exactly 5 below someone. Of those, the highest pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "offset",
      "value": 5
     },
     {
      "op": "all"
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 1
 },
 {
  "id": "rr-233",
  "category": "Neighbours",
  "family": "sum-partner",
  "text": "Your pick + someone else's = 3. Of those, the highest unique pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "sumPartner",
      "value": 3
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-250",
  "category": "Neighbours",
  "family": "sum-partner",
  "text": "Your pick + someone else's = 11. Of those, the lowest unique pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "sumPartner",
      "value": 11
     }
    ]
   },
   "rank": "lowest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-267",
  "category": "Neighbours",
  "family": "either-neighbour",
  "text": "Be exactly 1 away from someone. Of those, the highest unique pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "distance",
      "value": 1
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-276",
  "category": "Neighbours",
  "family": "either-neighbour",
  "text": "Be exactly 5 away from someone. Of those, the lowest unique pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "distance",
      "value": 5
     }
    ]
   },
   "rank": "lowest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-285",
  "category": "Neighbours",
  "family": "multiple-neighbour",
  "text": "Pick 2 times someone else's number. Of those, the highest unique pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "multiple",
      "value": 2
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-309",
  "category": "Neighbours",
  "family": "between-neighbours",
  "text": "Have someone above AND below you. Of those, the highest unique pick wins.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "between"
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-311",
  "category": "Greed & Regret",
  "family": "lone-number-risk",
  "text": "Only one 1? They win 20. Two or more 1s each lose 5. No 1, no winner.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "eq",
      "value": 1
     },
     {
      "op": "count",
      "eq": 1
     }
    ]
   },
   "rank": "all",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "and",
      "items": [
       {
        "op": "eq",
        "value": 1
       },
       {
        "op": "count",
        "min": 2
       }
      ]
     },
     "points": -5
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-326",
  "category": "Greed & Regret",
  "family": "lone-number-risk",
  "text": "Only one 6? They win 20. Two or more 6s each lose 10. No 6, no winner.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "eq",
      "value": 6
     },
     {
      "op": "count",
      "eq": 1
     }
    ]
   },
   "rank": "all",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "and",
      "items": [
       {
        "op": "eq",
        "value": 6
       },
       {
        "op": "count",
        "min": 2
       }
      ]
     },
     "points": -10
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-340",
  "category": "Greed & Regret",
  "family": "lone-number-risk",
  "text": "Only one 10? They win 30. Two or more 10s each lose 10. No 10, no winner.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "eq",
      "value": 10
     },
     {
      "op": "count",
      "eq": 1
     }
    ]
   },
   "rank": "all",
   "tiePolicy": "cancel",
   "reward": 30,
   "penalties": [
    {
     "filter": {
      "op": "and",
      "items": [
       {
        "op": "eq",
        "value": 10
       },
       {
        "op": "count",
        "min": 2
       }
      ]
     },
     "points": -10
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-341",
  "category": "Greed & Regret",
  "family": "low-safe-zone",
  "text": "Pick 1–2: highest unique wins 20. Picks above 2 lose 5.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "lte",
      "value": 2
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "gt",
      "value": 2
     },
     "points": -5
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-357",
  "category": "Greed & Regret",
  "family": "low-safe-zone",
  "text": "Pick 1–6: highest unique wins 20. Picks above 6 lose 5.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "lte",
      "value": 6
     }
    ]
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "gt",
      "value": 6
     },
     "points": -5
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-342",
  "category": "Greed & Regret",
  "family": "high-safe-zone",
  "text": "Pick 2–10: lowest unique wins 20. Picks below 2 lose 5.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "gte",
      "value": 2
     }
    ]
   },
   "rank": "lowest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "lt",
      "value": 2
     },
     "points": -5
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-358",
  "category": "Greed & Regret",
  "family": "high-safe-zone",
  "text": "Pick 6–10: lowest unique wins 20. Picks below 6 lose 5.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 1
     },
     {
      "op": "gte",
      "value": 6
     }
    ]
   },
   "rank": "lowest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "lt",
      "value": 6
     },
     "points": -5
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-373",
  "category": "Greed & Regret",
  "family": "taxed-number",
  "text": "Highest unique wins 20. Anyone picking 1 pays 5, even if they win.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "eq",
      "value": 1
     },
     "points": -5
    }
   ]
  },
  "tier": 1
 },
 {
  "id": "rr-383",
  "category": "Greed & Regret",
  "family": "taxed-number",
  "text": "Highest unique wins 20. Anyone picking 6 pays 5, even if they win.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "eq",
      "value": 6
     },
     "points": -5
    }
   ]
  },
  "tier": 1
 },
 {
  "id": "rr-393",
  "category": "Greed & Regret",
  "family": "collision-tax",
  "text": "Highest unique wins DOUBLE (20). Every matching pick loses 5.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": 20,
   "penalties": [
    {
     "filter": {
      "op": "count",
      "min": 2
     },
     "points": -5
    }
   ]
  },
  "tier": 2
 },
 {
  "id": "rr-397",
  "category": "Greed & Regret",
  "family": "risk-or-fallback",
  "text": "Lone 1 wins 20. Otherwise highest unique wins 10. Matching 1s lose 5.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 1,
    "exact": 1
   },
   "then": {
    "filter": {
     "op": "eq",
     "value": 1
    },
    "rank": "all",
    "tiePolicy": "cancel",
    "reward": 20,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": [
     {
      "filter": {
       "op": "and",
       "items": [
        {
         "op": "eq",
         "value": 1
        },
        {
         "op": "count",
         "min": 2
        }
       ]
      },
      "points": -5
     }
    ]
   }
  },
  "tier": 2
 },
 {
  "id": "rr-407",
  "category": "Greed & Regret",
  "family": "risk-or-fallback",
  "text": "Lone 6 wins 20. Otherwise highest unique wins 10. Matching 6s lose 5.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 6,
    "exact": 1
   },
   "then": {
    "filter": {
     "op": "eq",
     "value": 6
    },
    "rank": "all",
    "tiePolicy": "cancel",
    "reward": 20,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "highest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": [
     {
      "filter": {
       "op": "and",
       "items": [
        {
         "op": "eq",
         "value": 6
        },
        {
         "op": "count",
         "min": 2
        }
       ]
      },
      "points": -5
     }
    ]
   }
  },
  "tier": 2
 },
 {
  "id": "rr-417",
  "category": "Greed & Regret",
  "family": "winner-toll",
  "text": "Highest unique wins 20, then pays their number in points.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": {
    "op": "subtract",
    "from": 20,
    "factor": 1
   },
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-421",
  "category": "Greed & Regret",
  "family": "low-bonus",
  "text": "Highest unique wins. Their pick is 2 or below? 20 points. Otherwise 10.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": {
    "op": "conditional",
    "filter": {
     "op": "lte",
     "value": 2
    },
    "yes": 20,
    "no": 10
   },
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-429",
  "category": "Greed & Regret",
  "family": "low-bonus",
  "text": "Highest unique wins. Their pick is 6 or below? 20 points. Otherwise 10.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": {
    "op": "conditional",
    "filter": {
     "op": "lte",
     "value": 6
    },
    "yes": 20,
    "no": 10
   },
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-437",
  "category": "Greed & Regret",
  "family": "parity-bonus",
  "text": "Highest unique wins. An odd winning pick earns 20; otherwise 10.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "highest",
   "tiePolicy": "cancel",
   "reward": {
    "op": "conditional",
    "filter": {
     "op": "odd"
    },
    "yes": 20,
    "no": 10
   },
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-441",
  "category": "Greed & Regret",
  "family": "triple-or-fallback",
  "text": "Lone 1 wins 30. Otherwise lowest unique wins 10. Matching 1s lose 10.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 1,
    "exact": 1
   },
   "then": {
    "filter": {
     "op": "eq",
     "value": 1
    },
    "rank": "all",
    "tiePolicy": "cancel",
    "reward": 30,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": [
     {
      "filter": {
       "op": "and",
       "items": [
        {
         "op": "eq",
         "value": 1
        },
        {
         "op": "count",
         "min": 2
        }
       ]
      },
      "points": -10
     }
    ]
   }
  },
  "tier": 2
 },
 {
  "id": "rr-446",
  "category": "Greed & Regret",
  "family": "triple-or-fallback",
  "text": "Lone 6 wins 30. Otherwise lowest unique wins 10. Matching 6s lose 10.",
  "logic": {
   "condition": {
    "op": "numberCount",
    "number": 6,
    "exact": 1
   },
   "then": {
    "filter": {
     "op": "eq",
     "value": 6
    },
    "rank": "all",
    "tiePolicy": "cancel",
    "reward": 30,
    "penalties": []
   },
   "else": {
    "filter": {
     "op": "count",
     "eq": 1
    },
    "rank": "lowest",
    "tiePolicy": "cancel",
    "reward": 10,
    "penalties": [
     {
      "filter": {
       "op": "and",
       "items": [
        {
         "op": "eq",
         "value": 6
        },
        {
         "op": "count",
         "min": 2
        }
       ]
      },
      "points": -10
     }
    ]
   }
  },
  "tier": 2
 },
 {
  "id": "rr-451",
  "category": "Stand Alone",
  "family": "unique-extreme",
  "text": "Lowest unique number wins.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "lowest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": []
  },
  "tier": 1
 },
 {
  "id": "rr-455",
  "category": "Stand Alone",
  "family": "unique-distance",
  "text": "Among unique picks, closest to 1 wins.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "closest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": [],
   "target": 1
  },
  "tier": 1
 },
 {
  "id": "rr-465",
  "category": "Stand Alone",
  "family": "unique-distance",
  "text": "Among unique picks, closest to 6 wins.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "closest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": [],
   "target": 6
  },
  "tier": 1
 },
 {
  "id": "rr-475",
  "category": "Stand Alone",
  "family": "crowd-distance",
  "text": "Among unique picks, closest to everyone’s average wins.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 1
   },
   "rank": "closest",
   "tiePolicy": "cancel",
   "reward": 10,
   "penalties": [],
   "target": {
    "op": "average"
   }
  },
  "tier": 2
 },
 {
  "id": "rr-481",
  "category": "Find Your Twin",
  "family": "target-twins",
  "text": "Exactly TWO people pick 1? Both win. Three or more 1s cancel out.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 2
     },
     {
      "op": "eq",
      "value": 1
     }
    ]
   },
   "rank": "all",
   "tiePolicy": "share",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-486",
  "category": "Find Your Twin",
  "family": "target-twins",
  "text": "Exactly TWO people pick 6? Both win. Three or more 6s cancel out.",
  "logic": {
   "filter": {
    "op": "and",
    "items": [
     {
      "op": "count",
      "eq": 2
     },
     {
      "op": "eq",
      "value": 6
     }
    ]
   },
   "rank": "all",
   "tiePolicy": "share",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-491",
  "category": "Find Your Twin",
  "family": "ranked-twins",
  "text": "Highest number picked by exactly TWO wins for both. Three or more cancel out.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 2
   },
   "rank": "highest",
   "tiePolicy": "share",
   "reward": 10,
   "penalties": []
  },
  "tier": 2
 },
 {
  "id": "rr-493",
  "category": "Find Your Twin",
  "family": "all-twins",
  "text": "Exactly TWO matching picks both win. Three or more matching picks cancel out.",
  "logic": {
   "filter": {
    "op": "count",
    "eq": 2
   },
   "rank": "all",
   "tiePolicy": "share",
   "reward": 10,
   "penalties": []
  },
  "tier": 1
 }
];
