// The bar game, after "Beach Coffee × Giants" (design/giants/): coffee stays free and goes in
// arrival order; a boost (USDC on Solana, or points) moves an order up the queue; points come from the
// first cup of the day (more with a streak) and as cashback on USDC boosts, and are spent on boosts
// and the bar's shop. Points are loyalty points: not a token, not transferable, no cash value.

export const GAME = {
  firstCup: 20,          // points for the first cup of the day, when it's served
  streakBonus: 0.10,     // +10% on every reward per day in a row…
  streakCap: 5,          // …up to 5 days
  cashbackBase: 0.12,    // a 1 USDC boost gives 12% back in points (before streak and auction)
  cashbackGamma: 0.5,    // bigger boosts get a bigger share back, with diminishing returns
  cashbackMax: 0.40,     // never more than 40% back
  rushMult: 2,           // the morning auction (/rush) doubles the cashback…
  rushMinutes: 15,       // …for 15 minutes
  pointsPerUsdc: 100,    // a boost paid with points: 100 points per USDC
  boostOptions: [1, 2, 5],
  boostMax: 5,           // USDC per order, so nobody buys the whole queue
  freeGuardMin: 12,      // a free order waiting this long goes before the boosts
  prepMin: 1.5,          // minutes per cup, for the wait estimate
};

export const streakMult = streak => 1 + GAME.streakBonus * Math.min(Math.max(streak || 0, 0), GAME.streakCap);
export const firstCupPoints = streak => Math.round(GAME.firstCup * streakMult(streak));
export function cashbackRate(usdc, streak, rush) {
  const k = GAME.cashbackBase * Math.pow(Math.max(usdc, 0), GAME.cashbackGamma) * streakMult(streak) * (rush ? GAME.rushMult : 1);
  return Math.min(k, GAME.cashbackMax);
}
export const cashbackPoints = (usdc, streak, rush) => Math.round(cashbackRate(usdc, streak, rush) * usdc * GAME.pointsPerUsdc);

const DAY = 864e5;
const weekday = day => new Date(day + "T12:00:00Z").getUTCDay();
// The bar's previous open day: weekends are closed, so Friday → Monday keeps a streak.
export function previousOpenDay(day) {
  let t = Date.parse(day + "T12:00:00Z") - DAY;
  while ([0, 6].includes(new Date(t).getUTCDay())) t -= DAY;
  return new Date(t).toISOString().slice(0, 10);
}
// Days in a row with a coffee. A missed open day halves the streak; a new guest starts at 1.
export function nextStreak(streak, lastDay, today) {
  if (!lastDay) return 1;
  if (lastDay === today) return streak || 1;
  if (lastDay === previousOpenDay(today)) return (streak || 0) + 1;
  return Math.max(1, Math.floor((streak || 0) / 2));
}
export { weekday };

// The queue: free orders that waited freeGuardMin go first (oldest first), then boosted orders
// (biggest boost first, equal boosts keep arrival order), then free orders in arrival order.
export function queueOrder(orders, now = Date.now()) {
  const tier = o => (o.boost > 0 ? 1 : now - Date.parse(o.created_at) >= GAME.freeGuardMin * 60000 ? 0 : 2);
  return [...orders].sort((a, b) => tier(a) - tier(b) || (tier(a) === 1 ? b.boost - a.boost : 0) || a.created_at.localeCompare(b.created_at) || a.id - b.id)
    .map((o, i) => ({ ...o, position: i + 1, eta: Math.max(1, Math.round((i + 1) * GAME.prepMin)), guarded: tier(o) === 0 }));
}
