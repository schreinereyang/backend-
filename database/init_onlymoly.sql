
-- 📄 Fichier SQL : init_onlymoly.sql

CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  fan_id TEXT NOT NULL,
  sender TEXT CHECK (sender IN ('ia', 'fan')),
  text TEXT NOT NULL,
  model_id INTEGER REFERENCES models(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES models(id),
  fan_id TEXT,
  media_id TEXT,
  price NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  fan_id TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  model_id INTEGER REFERENCES models(id),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
