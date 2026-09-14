-- 1. Insert a test user (user_id will auto-increment to 1)
INSERT INTO users (first_name, last_name, email, password_hash) 
VALUES ('Test', 'User', 'wondie@gmail.com', '$2a$10$abcdefghijklmnopqrstuv');

-- 2. Insert a question using a valid 16-character hex hash
INSERT INTO questions (question_hash, user_id, title, content) 
VALUES ('a1b2c3d4e5f67890', 1, 'How to test single question endpoint?', 'I need help testing the GET /api/questions/:questionHash route in Express.');

-- 3. Insert a sample answer for this question
INSERT INTO answers (question_id, user_id, content) 
VALUES (1, 1, 'You can test it by making a GET request to /api/questions/a1b2c3d4e5f67890 in Postman or Thunder Client.');