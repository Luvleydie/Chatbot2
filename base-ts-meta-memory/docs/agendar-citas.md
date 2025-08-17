# Agenda de citas

1. Importa `docs/mysql-chatbot4.sql` en phpMyAdmin para crear la base de datos **chatbot4** con las tablas `candidatos` y `citas`.
2. Define las variables de entorno `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` (opcional, por defecto `chatbot4`).
3. Endpoints disponibles:
   - **POST `/api/cita`**: cuerpo `{ "telefono": "9999999999", "fecha": "2024-10-01" }`. Si la fecha está ocupada, el servidor agenda la siguiente fecha disponible.
   - **GET `/api/cita/:telefono`**: obtiene la cita asociada al teléfono indicado.

