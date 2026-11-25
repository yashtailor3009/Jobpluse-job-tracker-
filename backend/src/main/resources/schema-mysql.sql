-- Database initialization schema for MySQL 8.x
CREATE DATABASE IF NOT EXISTS job_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_tracker_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_url VARCHAR(1024),
    location VARCHAR(255),
    work_type VARCHAR(50) DEFAULT 'REMOTE',
    salary_range VARCHAR(100),
    date_applied DATE NOT NULL,
    deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    notes TEXT,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_date (user_id, date_applied)
);

CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_application_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    round_type VARCHAR(50) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    meeting_link VARCHAR(1024),
    interviewer VARCHAR(255),
    notes TEXT,
    outcome VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_app FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_schedule (user_id, scheduled_at)
);

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_application_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    storage_path VARCHAR(1024) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_app FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_app_doc (user_id, job_application_id)
);
