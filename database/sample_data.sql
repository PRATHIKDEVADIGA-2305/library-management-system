-- Sample Seeding Script for Library Management System

USE library_db;

-- Clear any existing data
DELETE FROM FINE;
DELETE FROM ISSUE;
DELETE FROM MEMBER;
DELETE FROM BOOK;
DELETE FROM CATEGORY;
DELETE FROM AUTHOR;

-- 1. AUTHOR Data
INSERT INTO AUTHOR (author_id, name, country) VALUES
(1, 'Donald Knuth', 'United States'),
(2, 'George Orwell', 'United Kingdom'),
(3, 'J.R.R. Tolkien', 'United Kingdom'),
(4, 'Yuval Noah Harari', 'Israel'),
(5, 'Stephen Hawking', 'United Kingdom'),
(6, 'Fyodor Dostoevsky', 'Russia');

-- 2. CATEGORY Data
INSERT INTO CATEGORY (category_id, category_name) VALUES
(10, 'Computer Science'),
(20, 'Fiction'),
(30, 'History'),
(40, 'Science'),
(50, 'Philosophy');

-- 3. BOOK Data
INSERT INTO BOOK (book_id, title, price, category_id, author_id, availability) VALUES
(101, 'The Art of Computer Programming', 125.50, 10, 1, 'Available'),
(102, 'Concrete Mathematics', 89.99, 10, 1, 'Available'),
(103, '1984', 14.99, 20, 2, 'Available'),
(104, 'Animal Farm', 9.99, 20, 2, 'Unavailable'),
(105, 'The Hobbit', 19.99, 20, 3, 'Available'),
(106, 'The Lord of the Rings', 35.00, 20, 3, 'Available'),
(107, 'Sapiens: A Brief History of Humankind', 24.95, 30, 4, 'Available'),
(108, 'Homo Deus', 25.00, 30, 4, 'Available'),
(109, 'A Brief History of Time', 18.50, 40, 5, 'Available'),
(110, 'Crime and Punishment', 12.00, 50, 6, 'Available');

-- 4. MEMBER Data
INSERT INTO MEMBER (member_id, name, phone, email) VALUES
(1001, 'John Doe', '555-0199', 'john.doe@email.com'),
(1002, 'Jane Smith', '555-0143', 'jane.smith@email.com'),
(1003, 'Alice Johnson', '555-0177', 'alice.j@email.com'),
(1004, 'Bob Brown', '555-0182', 'bob.brown@email.com'),
(1005, 'Charlie Davis', '555-0115', 'charlie.d@email.com');

-- 5. ISSUE Data
-- Issue 1: Book 104 (Animal Farm) is issued to Member 1001. Overdue and not returned yet.
-- (Availability of Book 104 is set to 'Unavailable')
INSERT INTO ISSUE (issue_id, book_id, member_id, issue_date, due_date, return_date) VALUES
(5001, 104, 1001, '2026-05-10', '2026-05-24', NULL),
-- Issue 2: Book 107 (Sapiens) was issued to Member 1002 and returned on time.
(5002, 107, 1002, '2026-05-12', '2026-05-26', '2026-05-25'),
-- Issue 3: Book 103 (1984) was issued to Member 1003 and returned late (due May 20, returned May 26).
(5003, 103, 1003, '2026-05-06', '2026-05-20', '2026-05-26'),
-- Issue 4: Book 109 (A Brief History of Time) was issued to Member 1004 and returned on time.
(5004, 109, 1004, '2026-06-01', '2026-06-15', '2026-06-10');

-- 6. FINE Data
-- Fine 1: Generated for Alice Johnson (Member 1003) for returning 1984 late (6 days late * $1.50 = $9.00)
INSERT INTO FINE (fine_id, member_id, amount, paid_status) VALUES
(1, 1003, 9.00, 'Unpaid'),
-- Fine 2: A historic fine for Bob Brown (Member 1004) that has been paid
(2, 1004, 4.50, 'Paid');
