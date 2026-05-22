-- GameTime Database Schema
-- Base de datos: game_time

CREATE DATABASE IF NOT EXISTS game_time CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE game_time;

-- ============================
-- USUARIOS DEL SISTEMA
-- ============================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'directiva') NOT NULL DEFAULT 'directiva',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================
-- EQUIPOS
-- ============================
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  gender ENUM('masculino', 'femenino', 'mixto') NOT NULL,
  short_name VARCHAR(5) NOT NULL,
  logo_color VARCHAR(100) DEFAULT 'from-orange-500 to-amber-600',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================
-- JUGADORES
-- ============================
CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  number INT NOT NULL,
  position VARCHAR(50) DEFAULT NULL,
  gender ENUM('masculino', 'femenino') NOT NULL,
  status ENUM('activo', 'lesionado', 'suspendido') NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_number (team_id, number)
);

-- ============================
-- ÁRBITROS
-- ============================
CREATE TABLE IF NOT EXISTS referees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  certification VARCHAR(100) DEFAULT 'FIBA',
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  status ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================
-- CAMPEONATOS
-- ============================
CREATE TABLE IF NOT EXISTS championships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  gender ENUM('masculino', 'femenino', 'mixto') NOT NULL,
  total_teams INT NOT NULL DEFAULT 4,
  status ENUM('draft', 'active', 'finished') NOT NULL DEFAULT 'draft',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================
-- EQUIPOS EN CAMPEONATO
-- ============================
CREATE TABLE IF NOT EXISTS championship_teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  championship_id INT NOT NULL,
  team_id INT NOT NULL,
  seed INT DEFAULT NULL,
  pj INT DEFAULT 0,
  pg INT DEFAULT 0,
  pp INT DEFAULT 0,
  pts INT DEFAULT 0,
  dif INT DEFAULT 0,
  FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_champ_team (championship_id, team_id)
);

-- ============================
-- PARTIDOS
-- ============================
CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  championship_id INT NOT NULL,
  round INT NOT NULL DEFAULT 1,
  home_team_id INT NOT NULL,
  away_team_id INT NOT NULL,
  referee_id INT DEFAULT NULL,
  ref1_id INT DEFAULT NULL,
  ref2_id INT DEFAULT NULL,
  court VARCHAR(150) DEFAULT 'Coliseo Principal',
  scheduled_at DATETIME DEFAULT NULL,
  status ENUM('scheduled', 'live', 'finished') NOT NULL DEFAULT 'scheduled',
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  current_quarter INT DEFAULT 0,
  home_fouls_q INT DEFAULT 0,
  away_fouls_q INT DEFAULT 0,
  started_at TIMESTAMP NULL,
  finished_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id),
  FOREIGN KEY (referee_id) REFERENCES referees(id) ON DELETE SET NULL,
  FOREIGN KEY (ref1_id) REFERENCES referees(id) ON DELETE SET NULL,
  FOREIGN KEY (ref2_id) REFERENCES referees(id) ON DELETE SET NULL
);

-- ============================
-- JUGADORES EN PARTIDO
-- ============================
CREATE TABLE IF NOT EXISTS match_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  team_id INT NOT NULL,
  points INT DEFAULT 0,
  fouls INT DEFAULT 0,
  is_ejected TINYINT(1) DEFAULT 0,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  UNIQUE KEY unique_match_player (match_id, player_id)
);

-- ============================
-- EVENTOS DEL PARTIDO
-- ============================
CREATE TABLE IF NOT EXISTS match_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  quarter INT NOT NULL DEFAULT 1,
  type ENUM('score1','score2','score3','foul','eject','quarter_end','match_end','foul_bonus') NOT NULL,
  team_id INT DEFAULT NULL,
  player_id INT DEFAULT NULL,
  description TEXT,
  home_score_snapshot INT DEFAULT NULL,
  away_score_snapshot INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- ============================
-- SEED: Usuario Admin por defecto
-- Contraseña: Admin2026!  (hasheada con bcrypt rounds=10)
-- ============================
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Administrador', 'admin@gametime.ec', '$2a$10$FPJaBbPQi7k8hSW9oTs4rONuKo9S96mVLXZQmlvXe79FgTxn8.mzO', 'admin'),
('Directiva', 'directiva@gametime.ec', '$2a$10$FPJaBbPQi7k8hSW9oTs4rONuKo9S96mVLXZQmlvXe79FgTxn8.mzO', 'directiva');
