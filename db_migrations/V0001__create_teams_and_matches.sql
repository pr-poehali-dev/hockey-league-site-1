CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER NOT NULL REFERENCES teams(id),
  away_team_id INTEGER NOT NULL REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  twitch_channel VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO teams (name) VALUES 
  ('Северные Волки'),
  ('Стальные Акулы'),
  ('Огненные Драконы'),
  ('Ледяные Медведи'),
  ('Грозовые Быки'),
  ('Молнии'),
  ('Северное Сияние'),
  ('Метеоры');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, match_time, status, twitch_channel) VALUES
  (1, 3, NULL, NULL, '2025-10-28', '19:00', 'upcoming', 'phl_official'),
  (2, 4, NULL, NULL, '2025-10-28', '21:00', 'upcoming', 'phl_official'),
  (5, 6, 2, 1, '2025-10-27', '19:00', 'live', 'phl_official'),
  (8, 7, 3, 4, '2025-10-26', '19:00', 'finished', NULL),
  (1, 2, 4, 2, '2025-10-26', '21:00', 'finished', NULL),
  (3, 5, 3, 1, '2025-10-25', '19:00', 'finished', NULL),
  (4, 6, 2, 2, '2025-10-25', '21:00', 'finished', NULL),
  (7, 8, 1, 0, '2025-10-24', '19:00', 'finished', NULL),
  (2, 3, 5, 3, '2025-10-24', '21:00', 'finished', NULL),
  (1, 4, 4, 1, '2025-10-23', '19:00', 'finished', NULL),
  (5, 7, 3, 2, '2025-10-23', '21:00', 'finished', NULL),
  (6, 8, 4, 1, '2025-10-22', '19:00', 'finished', NULL);

CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date DESC);