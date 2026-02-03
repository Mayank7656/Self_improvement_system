import { StatDelta } from "../models/Stat";

export type TaskScoringInput = {
  category: string;
  tags?: string[];
};

const baseDelta = (): StatDelta => ({
  stamina: 0,
  skills: 0,
  intelligence: 0,
  power: 0,
  timeManagement: 0,
});

const categoryRules: Record<string, StatDelta> = {
  fitness: {
    stamina: 6,
    skills: 0,
    intelligence: 1,
    power: 4,
    timeManagement: 0,
  },
  learning: {
    stamina: 0,
    skills: 5,
    intelligence: 6,
    power: 0,
    timeManagement: 2,
  },
  planning: {
    stamina: 0,
    skills: 2,
    intelligence: 1,
    power: 0,
    timeManagement: 6,
  },
  recovery: {
    stamina: 4,
    skills: 0,
    intelligence: 0,
    power: 2,
    timeManagement: 1,
  },
  execution: {
    stamina: 2,
    skills: 3,
    intelligence: 0,
    power: 4,
    timeManagement: 2,
  },
};

const tagRules: Record<string, StatDelta> = {
  deepWork: {
    stamina: 0,
    skills: 2,
    intelligence: 3,
    power: 2,
    timeManagement: 1,
  },
  collaboration: {
    stamina: 0,
    skills: 3,
    intelligence: 1,
    power: 0,
    timeManagement: 2,
  },
  mindfulness: {
    stamina: 2,
    skills: 0,
    intelligence: 1,
    power: 1,
    timeManagement: 0,
  },
  strength: {
    stamina: 2,
    skills: 0,
    intelligence: 0,
    power: 3,
    timeManagement: 0,
  },
};

const addDelta = (total: StatDelta, delta: StatDelta) => ({
  stamina: total.stamina + delta.stamina,
  skills: total.skills + delta.skills,
  intelligence: total.intelligence + delta.intelligence,
  power: total.power + delta.power,
  timeManagement: total.timeManagement + delta.timeManagement,
});

export const getTaskStatDelta = ({ category, tags = [] }: TaskScoringInput) => {
  let total = baseDelta();

  if (categoryRules[category]) {
    total = addDelta(total, categoryRules[category]);
  }

  tags.forEach((tag) => {
    const rule = tagRules[tag];
    if (rule) {
      total = addDelta(total, rule);
    }
  });

  return total;
};
