-- Orders placed through the Telegram bot. `num` restarts at 1 every day.
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  num INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  drink TEXT NOT NULL,
  customer_chat INTEGER NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  barista_message_id INTEGER
);

CREATE INDEX IF NOT EXISTS orders_day ON orders (day);
CREATE INDEX IF NOT EXISTS orders_customer ON orders (customer_chat, status);

-- When an order was marked ready (Telegram button or panel), for the time from tap to ready.
CREATE TABLE IF NOT EXISTS order_times (
  order_id INTEGER PRIMARY KEY,
  ready_at TEXT NOT NULL
);

-- Optional extras of an order, today only the milk (lactose-free or plant-based). No row = regular.
CREATE TABLE IF NOT EXISTS order_extras (
  order_id INTEGER PRIMARY KEY,
  milk TEXT NOT NULL
);

-- Key/value settings: barista_chat (where orders arrive), open ("1"/"0").
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- USDC payments on Solana: tips and the Island DAO coffee bag. Drinks are free.
-- amount_micro is USDC × 1,000,000. customer_chat 0 = paid from the web page (/pay).
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  amount_micro INTEGER NOT NULL,
  day TEXT NOT NULL,
  created_at TEXT NOT NULL,
  customer_chat INTEGER NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  signature TEXT UNIQUE,
  payer TEXT,
  paid_at TEXT,
  checked_at TEXT,
  handed_over INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS payments_status ON payments (status, created_at);
CREATE INDEX IF NOT EXISTS payments_day ON payments (day, status);

-- What happens on the pay pages (wallet buttons tapped, wallet errors, transactions the network
-- dropped), so /payments can say where tips get stuck. step: open, tap, pay, funds, sent, cancel, error, dropped.
CREATE TABLE IF NOT EXISTS pay_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL,
  at TEXT NOT NULL,
  step TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS pay_events_payment ON pay_events (payment_id);

-- USDC that reached the shop's wallet without a checkout reference (an exchange, a plain transfer)
-- and matched no open checkout. The barista is told about each one.
CREATE TABLE IF NOT EXISTS direct_transfers (
  signature TEXT PRIMARY KEY,
  payer TEXT NOT NULL DEFAULT '',
  amount_micro INTEGER NOT NULL,
  day TEXT NOT NULL,
  at TEXT NOT NULL
);

-- Coffee check-ins onchain: the guest's wallet signs a memo transaction for an order; the bar's
-- check-in wallet (CHECKIN_KEY) pays the fee. One per order. status: open, sent, done, failed.
CREATE TABLE IF NOT EXISTS checkins (
  order_id INTEGER PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  customer_chat INTEGER NOT NULL,
  day TEXT NOT NULL,
  wallet TEXT,
  message TEXT,
  fee_signature TEXT,
  signature TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  sent_at TEXT,
  done_at TEXT
);
CREATE INDEX IF NOT EXISTS checkins_day ON checkins (day, status);

-- The bar game (points, streaks, boosts, shop). Points are loyalty points, only spent at the bar.
CREATE TABLE IF NOT EXISTS islanders (
  chat INTEGER PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_day TEXT
);
-- Every change of points. (chat, reason, ref) is unique, so a reward is never given twice.
-- reason: first_cup, cashback, boost, shop.
CREATE TABLE IF NOT EXISTS points_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  day TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS points_once ON points_log (chat, reason, ref);
-- Boosts on an order (USDC or points); the queue sorts by their sum.
CREATE TABLE IF NOT EXISTS order_boosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  micro INTEGER NOT NULL,
  paid_with TEXT NOT NULL,
  ref TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS order_boosts_order ON order_boosts (order_id);
-- Which order a USDC boost payment is for.
CREATE TABLE IF NOT EXISTS boost_payments (
  payment_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL
);
-- Shop items redeemed with points, to hand over at the bar.
CREATE TABLE IF NOT EXISTS shop_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat INTEGER NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  item TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  handed INTEGER NOT NULL DEFAULT 0
);
