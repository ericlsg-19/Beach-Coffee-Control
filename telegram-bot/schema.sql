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
