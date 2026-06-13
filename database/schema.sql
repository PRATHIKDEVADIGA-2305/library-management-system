-- Library Management System Schema

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Drop tables in reverse order of dependencies if they exist
DROP TABLE IF EXISTS FINE;
DROP TABLE IF EXISTS ISSUE;
DROP TABLE IF EXISTS MEMBER;
DROP TABLE IF EXISTS BOOK;
DROP TABLE IF EXISTS CATEGORY;
DROP TABLE IF EXISTS AUTHOR;

-- 1. AUTHOR Table
CREATE TABLE AUTHOR (
    author_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50)
);

-- 2. CATEGORY Table
CREATE TABLE CATEGORY (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- 3. BOOK Table
CREATE TABLE BOOK (
    book_id INT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    category_id INT,
    author_id INT,
    availability VARCHAR(20) DEFAULT 'Available',
    FOREIGN KEY(category_id) REFERENCES CATEGORY(category_id) ON DELETE SET NULL,
    FOREIGN KEY(author_id) REFERENCES AUTHOR(author_id) ON DELETE SET NULL
);

-- 4. MEMBER Table
CREATE TABLE MEMBER (
    member_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100)
);

-- 5. ISSUE Table
CREATE TABLE ISSUE (
    issue_id INT PRIMARY KEY,
    book_id INT,
    member_id INT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    FOREIGN KEY(book_id) REFERENCES BOOK(book_id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES MEMBER(member_id) ON DELETE CASCADE
);

-- 6. FINE Table
CREATE TABLE FINE (
    fine_id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT,
    amount DECIMAL(10,2) NOT NULL,
    paid_status VARCHAR(20) DEFAULT 'Unpaid',
    FOREIGN KEY(member_id) REFERENCES MEMBER(member_id) ON DELETE CASCADE
);

-- =======================================================
-- TRIGGERS
-- =======================================================

DROP TRIGGER IF EXISTS after_issue_insert;
DROP TRIGGER IF EXISTS after_issue_update;

DELIMITER //

-- Trigger 1: Automatically change book availability to 'Unavailable' when issued
CREATE TRIGGER after_issue_insert
AFTER INSERT ON ISSUE
FOR EACH ROW
BEGIN
    UPDATE BOOK 
    SET availability = 'Unavailable' 
    WHERE book_id = NEW.book_id;
END //

-- Trigger 2: Automatically change availability back to 'Available' on return
-- and calculate fine if return_date is late
CREATE TRIGGER after_issue_update
AFTER UPDATE ON ISSUE
FOR EACH ROW
BEGIN
    -- Detect if return_date has just been set
    IF NEW.return_date IS NOT NULL AND OLD.return_date IS NULL THEN
        UPDATE BOOK 
        SET availability = 'Available' 
        WHERE book_id = NEW.book_id;
        
        -- Detect late return and generate fine (e.g. $1.50 per day overdue)
        IF NEW.return_date > NEW.due_date THEN
            INSERT INTO FINE (member_id, amount, paid_status)
            VALUES (
                NEW.member_id, 
                DATEDIFF(NEW.return_date, NEW.due_date) * 1.50, 
                'Unpaid'
            );
        END IF;
    END IF;
END //

DELIMITER ;

-- =======================================================
-- STORED PROCEDURES
-- =======================================================

DROP PROCEDURE IF EXISTS IssueBook;
DROP PROCEDURE IF EXISTS CalculateFine;

DELIMITER //

-- Stored Procedure 1: IssueBook()
CREATE PROCEDURE IssueBook(
    IN p_issue_id INT,
    IN p_book_id INT,
    IN p_member_id INT,
    IN p_issue_date DATE,
    IN p_due_date DATE
)
BEGIN
    DECLARE v_availability VARCHAR(20);
    
    -- Check if book is available
    SELECT availability INTO v_availability 
    FROM BOOK 
    WHERE book_id = p_book_id;
    
    IF v_availability = 'Available' THEN
        INSERT INTO ISSUE (issue_id, book_id, member_id, issue_date, due_date, return_date)
        VALUES (p_issue_id, p_book_id, p_member_id, p_issue_date, p_due_date, NULL);
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Book is currently unavailable.';
    END IF;
END //

-- Stored Procedure 2: CalculateFine()
CREATE PROCEDURE CalculateFine(
    IN p_issue_id INT,
    OUT p_fine_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_due_date DATE;
    DECLARE v_return_date DATE;
    DECLARE v_days_overdue INT;
    
    SELECT due_date, return_date INTO v_due_date, v_return_date 
    FROM ISSUE 
    WHERE issue_id = p_issue_id;
    
    -- If not yet returned, calculate fine up to current date
    IF v_return_date IS NULL THEN
        SET v_return_date = CURDATE();
    END IF;
    
    IF v_return_date > v_due_date THEN
        SET v_days_overdue = DATEDIFF(v_return_date, v_due_date);
        SET p_fine_amount = v_days_overdue * 1.50;
    ELSE
        SET p_fine_amount = 0.00;
    END IF;
END //

DELIMITER ;
