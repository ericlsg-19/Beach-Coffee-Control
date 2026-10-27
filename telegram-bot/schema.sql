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

-- Key/value settings: barista_chat (where orders arrive), open ("1"/"0").
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
