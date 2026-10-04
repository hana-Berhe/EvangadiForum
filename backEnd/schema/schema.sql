-- Database Schema for Evangadi Forum
-- Platform: MySQL 

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- Stores user account information.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(320) NOT NULL UNIQUE,
    `bio` TEXT NULL,
    `avatar` VARCHAR(255) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (`email` = LOWER(`email`)),
    
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Questions Table
-- Stores the main questions posted by users.
-- Supports full-text search on title and content for exact match search.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
    `question_id` INT AUTO_INCREMENT PRIMARY KEY,
    `question_hash` CHAR(16) NOT NULL UNIQUE, -- Used for /question/:hash routing
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL, -- Detailed content including code sections
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (CHAR_LENGTH(`title`) >= 5),
    CHECK (CHAR_LENGTH(`content`) >= 10),
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    
    INDEX `idx_questions_user_id` (`user_id`),
    INDEX `idx_questions_created_at` (`created_at`),
    
    -- Full-text search index for exact match search mode
    FULLTEXT KEY `ft_questions_search` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Question Vectors Table
-- Stores embeddings for the AI Semantic Search feature (Gemini default model).
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `question_vectors`;
CREATE TABLE `question_vectors` (
    `vector_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question_id` INT NOT NULL,
    `source_text` TEXT NOT NULL, -- Text used to generate the embedding
    `embedding` JSON NOT NULL,   -- Gemini embedding vector
    `status` VARCHAR(20) DEFAULT 'ready', -- e.g., 'ready', 'pending', 'failed'
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE,
    UNIQUE KEY `uniq_question_vectors_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Answers Table
-- Stores answers to questions.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `answers`;
CREATE TABLE `answers` (
    `answer_id` INT AUTO_INCREMENT PRIMARY KEY,
    `question_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `content` TEXT NOT NULL, -- Content including code sections
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    
    INDEX `idx_answers_question_id` (`question_id`),
    INDEX `idx_answers_user_id` (`user_id`),
    INDEX `idx_answers_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. RAG: user-owned PDF documents, text chunks, and chunk embeddings
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
    `document_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(512) NOT NULL,
    `mime_type` VARCHAR(128) NOT NULL DEFAULT 'application/pdf',
    `storage_path` VARCHAR(1024) NOT NULL,
    `byte_size` BIGINT NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `error_message` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    INDEX `idx_documents_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `document_chunks`;
CREATE TABLE `document_chunks` (
    `chunk_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `document_id` INT NOT NULL,
    `chunk_index` INT NOT NULL,
    `content` TEXT NOT NULL,
    `page_start` INT NULL,
    `page_end` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`document_id`) REFERENCES `documents`(`document_id`) ON DELETE CASCADE,
    UNIQUE KEY `uniq_document_chunks_doc_index` (`document_id`, `chunk_index`),
    INDEX `idx_document_chunks_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `document_chunk_vectors`;
CREATE TABLE `document_chunk_vectors` (
    `chunk_vector_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `chunk_id` BIGINT NOT NULL,
    `source_text` TEXT NOT NULL,
    `embedding` JSON NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ready',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`chunk_id`) REFERENCES `document_chunks`(`chunk_id`) ON DELETE CASCADE,
    UNIQUE KEY `uniq_chunk_vectors_chunk_id` (`chunk_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Discussion Rooms: fixed rooms, their members, and their messages
-- Users cannot create rooms; only the fixed rooms at the bottom exist.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
    `room_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(60) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_rooms_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The many-to-many link between users and rooms.
-- The UNIQUE key makes a second join impossible, even in a race.
DROP TABLE IF EXISTS `room_members`;
CREATE TABLE `room_members` (
    `room_member_id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    UNIQUE KEY `uniq_room_members_room_user` (`room_id`, `user_id`),
    INDEX `idx_room_members_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plain-text messages, 1 to 2000 characters. message_id is the ordering key
-- (timestamps can tie inside one second, ids cannot). The (room_id, message_id)
-- index serves "the latest 50 of a room".
DROP TABLE IF EXISTS `room_messages`;
CREATE TABLE `room_messages` (
    `message_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `content` VARCHAR(2000) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    INDEX `idx_room_messages_room_message` (`room_id`, `message_id`),
    INDEX `idx_room_messages_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rooms` (`name`, `description`) VALUES
    ('General Discussion', 'Introduce yourself, ask anything, and chat with fellow learners.'),
    ('Frontend Development', 'HTML, CSS, JavaScript and React: layouts, components and bugs.'),
    ('Backend Development', 'Node.js, Express and REST APIs: routes, auth and server errors.'),
    ('Databases & SQL', 'MySQL queries, table design and connecting your app to a database.'),
    ('Projects & Code Review', 'Share what you built and get feedback on your code.'),
    ('Career & Interviews', 'CVs, portfolios, interview practice and landing your first job.');

SET FOREIGN_KEY_CHECKS = 1;