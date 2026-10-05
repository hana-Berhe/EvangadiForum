SET @tag_column_sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'questions'
      AND column_name = 'tag'
  ) = 0,
  'ALTER TABLE questions ADD COLUMN tag VARCHAR(50) NULL',
  'SELECT 1'
);
PREPARE tag_column_statement FROM @tag_column_sql;
EXECUTE tag_column_statement;
DEALLOCATE PREPARE tag_column_statement;

SET @tag_index_sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'questions'
      AND index_name = 'idx_questions_tag'
  ) = 0,
  'ALTER TABLE questions ADD INDEX idx_questions_tag (tag)',
  'SELECT 1'
);
PREPARE tag_index_statement FROM @tag_index_sql;
EXECUTE tag_index_statement;
DEALLOCATE PREPARE tag_index_statement;
