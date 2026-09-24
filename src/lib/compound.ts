// Pure math for the compound-growth chart. Numbers on screen come only from this formula.
export type CompoundInput = { start: number; monthly: number; ratePct: number; years: number };
export type CompoundPoint = { year: number; balance: number; contributed: number };

export const compoundSeries = ({ start, monthly, ratePct, years }: CompoundInput): CompoundPoint[] => {
  const r = ratePct / 100 / 12;
  const points: CompoundPoint[] = [{ year: 0, balance: start, contributed: start }];
  let balance = start;
  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + r) + monthly;
    if (m % 12 === 0) points.push({ year: m / 12, balance, contributed: start + monthly * m });
  }
  return points;
};

export const usd = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 10_000 ? `$${Math.round(n / 1000)}K` : `$${Math.round(n).toLocaleString('en-US')}`;
