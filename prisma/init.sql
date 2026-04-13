-- Optional: Initialize database with additional setup
-- This file runs automatically when the MySQL container starts for the first time

USE pkdac_db;

-- Grant additional privileges if needed
GRANT ALL PRIVILEGES ON pkdac_db.* TO 'pkdac_user'@'%';
FLUSH PRIVILEGES;
