CREATE DATABASE IF NOT EXISTS chatbot4;
USE chatbot4;

CREATE TABLE IF NOT EXISTS candidatos (
  telefono VARCHAR(20) PRIMARY KEY,
  edad VARCHAR(20),
  vivienda VARCHAR(50),
  cochera TINYINT(1),
  dependientes VARCHAR(20),
  recibo_predial TINYINT(1),
  rento_antes TINYINT(1)
);

CREATE TABLE IF NOT EXISTS citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telefono VARCHAR(20) NOT NULL,
  fecha DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

