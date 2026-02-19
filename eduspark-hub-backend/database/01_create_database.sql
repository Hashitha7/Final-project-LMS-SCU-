-- =====================================================
-- EduSpark Hub - Database Creation Script
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS eduspark_hub
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE eduspark_hub;

-- Show confirmation
SELECT 'Database eduspark_hub created successfully!' AS Status;
