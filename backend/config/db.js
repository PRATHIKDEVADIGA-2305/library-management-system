import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let useMock = false;

// Mock database storage
const mockDb = {
  authors: [
    { author_id: 1, name: 'Donald Knuth', country: 'United States' },
    { author_id: 2, name: 'George Orwell', country: 'United Kingdom' },
    { author_id: 3, name: 'J.R.R. Tolkien', country: 'United Kingdom' },
    { author_id: 4, name: 'Yuval Noah Harari', country: 'Israel' },
    { author_id: 5, name: 'Stephen Hawking', country: 'United Kingdom' },
    { author_id: 6, name: 'Fyodor Dostoevsky', country: 'Russia' }
  ],
  categories: [
    { category_id: 10, category_name: 'Computer Science' },
    { category_id: 20, category_name: 'Fiction' },
    { category_id: 30, category_name: 'History' },
    { category_id: 40, category_name: 'Science' },
    { category_id: 50, category_name: 'Philosophy' }
  ],
  books: [
    { book_id: 101, title: 'The Art of Computer Programming', price: 125.50, category_id: 10, author_id: 1, availability: 'Available' },
    { book_id: 102, title: 'Concrete Mathematics', price: 89.99, category_id: 10, author_id: 1, availability: 'Available' },
    { book_id: 103, title: '1984', price: 14.99, category_id: 20, author_id: 2, availability: 'Available' },
    { book_id: 104, title: 'Animal Farm', price: 9.99, category_id: 20, author_id: 2, availability: 'Unavailable' },
    { book_id: 105, title: 'The Hobbit', price: 19.99, category_id: 20, author_id: 3, availability: 'Available' },
    { book_id: 106, title: 'The Lord of the Rings', price: 35.00, category_id: 20, author_id: 3, availability: 'Available' },
    { book_id: 107, title: 'Sapiens: A Brief History of Humankind', price: 24.95, category_id: 30, author_id: 4, availability: 'Available' },
    { book_id: 108, title: 'Homo Deus', price: 25.00, category_id: 30, author_id: 4, availability: 'Available' },
    { book_id: 109, title: 'A Brief History of Time', price: 18.50, category_id: 40, author_id: 5, availability: 'Available' },
    { book_id: 110, title: 'Crime and Punishment', price: 12.00, category_id: 50, author_id: 6, availability: 'Available' }
  ],
  members: [
    { member_id: 1001, name: 'John Doe', phone: '555-0199', email: 'john.doe@email.com' },
    { member_id: 1002, name: 'Jane Smith', phone: '555-0143', email: 'jane.smith@email.com' },
    { member_id: 1003, name: 'Alice Johnson', phone: '555-0177', email: 'alice.j@email.com' },
    { member_id: 1004, name: 'Bob Brown', phone: '555-0182', email: 'bob.brown@email.com' },
    { member_id: 1005, name: 'Charlie Davis', phone: '555-0115', email: 'charlie.d@email.com' }
  ],
  issues: [
    { issue_id: 5001, book_id: 104, member_id: 1001, issue_date: '2026-05-10', due_date: '2026-05-24', return_date: null },
    { issue_id: 5002, book_id: 107, member_id: 1002, issue_date: '2026-05-12', due_date: '2026-05-26', return_date: '2026-05-25' },
    { issue_id: 5003, book_id: 103, member_id: 1003, issue_date: '2026-05-06', due_date: '2026-05-20', return_date: '2026-05-26' },
    { issue_id: 5004, book_id: 109, member_id: 1004, issue_date: '2026-06-01', due_date: '2026-06-15', return_date: '2026-06-10' }
  ],
  fines: [
    { fine_id: 1, member_id: 1003, amount: 9.00, paid_status: 'Unpaid' },
    { fine_id: 2, member_id: 1004, amount: 4.50, paid_status: 'Paid' }
  ],
  activityLogs: [
    { timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), activity: 'Book "A Brief History of Time" returned by Bob Brown.' },
    { timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), activity: 'Fine of $9.00 generated for Alice Johnson (late return of "1984").' },
    { timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), activity: 'Book "Animal Farm" issued to John Doe.' }
  ]
};

// Initialize DB Connection
try {
  console.log('Attempting to connect to MySQL database...');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2000 // 2 seconds timeout to fail fast
  });

  // Test connection
  const conn = await pool.getConnection();
  console.log('Successfully connected to MySQL database!');
  conn.release();
} catch (err) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️ MySQL Connection failed: ' + err.message);
  console.warn('\x1b[36m%s\x1b[0m', '💡 Falling back to the In-Memory Mock Database Driver.');
  useMock = true;
}

// Custom mock queries processor
const runMockQuery = (sql, params = []) => {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');

  // Logger helper
  const addLog = (activity) => {
    mockDb.activityLogs.unshift({
      timestamp: new Date().toISOString(),
      activity
    });
  };

  // --- STORED PROCEDURES & CUSTOM ACTIONS ---

  // Procedure: CALL IssueBook(?,?,?,?,?)
  if (normalizedSql.toUpperCase().startsWith('CALL ISSUEBOOK')) {
    const [id, bookId, memberId, issueDate, dueDate] = params;
    const book = mockDb.books.find(b => b.book_id === Number(bookId));
    if (!book) throw new Error('Book not found.');
    if (book.availability !== 'Available') throw new Error('Book is currently unavailable.');
    
    // Insert issue
    mockDb.issues.push({
      issue_id: Number(id),
      book_id: Number(bookId),
      member_id: Number(memberId),
      issue_date: issueDate,
      due_date: dueDate,
      return_date: null
    });

    // Trigger effect: Update book availability to 'Unavailable'
    book.availability = 'Unavailable';

    // Activity Log
    const member = mockDb.members.find(m => m.member_id === Number(memberId));
    addLog(`[Trigger Effect] Issued Book "${book.title}" to ${member ? member.name : 'Member ID ' + memberId}. Status changed to Unavailable.`);

    return [{ affectedRows: 1 }];
  }

  // Procedure: CALL CalculateFine(?, @fine)
  if (normalizedSql.toUpperCase().startsWith('CALL CALCULATEFINE')) {
    const [issueId] = params;
    const issue = mockDb.issues.find(i => i.issue_id === Number(issueId));
    if (!issue) throw new Error('Issue record not found.');

    const due = new Date(issue.due_date);
    const ret = issue.return_date ? new Date(issue.return_date) : new Date();
    
    let fineAmount = 0.00;
    if (ret > due) {
      const diffTime = Math.abs(ret - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 1.50;
    }
    return [[{ fine_amount: fineAmount }]];
  }

  // --- CRUD FOR AUTHORS ---
  if (normalizedSql.toUpperCase().includes('INSERT INTO AUTHOR')) {
    const [id, name, country] = params;
    if (mockDb.authors.some(a => a.author_id === Number(id))) {
      throw new Error(`Duplicate entry for author_id ${id}`);
    }
    mockDb.authors.push({ author_id: Number(id), name, country });
    addLog(`Added Author: "${name}" (${country}).`);
    return { affectedRows: 1 };
  }
  if (normalizedSql.toUpperCase().includes('UPDATE AUTHOR')) {
    const [name, country, id] = params;
    const index = mockDb.authors.findIndex(a => a.author_id === Number(id));
    if (index !== -1) {
      mockDb.authors[index] = { ...mockDb.authors[index], name, country };
      addLog(`Updated Author: "${name}" (${country}).`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalizedSql.toUpperCase().includes('DELETE FROM AUTHOR')) {
    const [id] = params;
    const index = mockDb.authors.findIndex(a => a.author_id === Number(id));
    if (index !== -1) {
      const name = mockDb.authors[index].name;
      mockDb.authors.splice(index, 1);
      // Cascading set null on book
      mockDb.books.forEach(b => {
        if (b.author_id === Number(id)) b.author_id = null;
      });
      addLog(`Deleted Author: "${name}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // --- CRUD FOR CATEGORIES ---
  if (normalizedSql.toUpperCase().includes('INSERT INTO CATEGORY')) {
    const [id, name] = params;
    if (mockDb.categories.some(c => c.category_id === Number(id))) {
      throw new Error(`Duplicate entry for category_id ${id}`);
    }
    mockDb.categories.push({ category_id: Number(id), category_name: name });
    addLog(`Created Category: "${name}".`);
    return { affectedRows: 1 };
  }
  if (normalizedSql.toUpperCase().includes('UPDATE CATEGORY')) {
    const [name, id] = params;
    const index = mockDb.categories.findIndex(c => c.category_id === Number(id));
    if (index !== -1) {
      mockDb.categories[index] = { ...mockDb.categories[index], category_name: name };
      addLog(`Updated Category to: "${name}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalizedSql.toUpperCase().includes('DELETE FROM CATEGORY')) {
    const [id] = params;
    const index = mockDb.categories.findIndex(c => c.category_id === Number(id));
    if (index !== -1) {
      const name = mockDb.categories[index].category_name;
      mockDb.categories.splice(index, 1);
      // Cascading set null on book
      mockDb.books.forEach(b => {
        if (b.category_id === Number(id)) b.category_id = null;
      });
      addLog(`Deleted Category: "${name}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // --- CRUD FOR BOOKS ---
  if (normalizedSql.toUpperCase().includes('INSERT INTO BOOK')) {
    const [id, title, price, catId, autId, availability] = params;
    if (mockDb.books.some(b => b.book_id === Number(id))) {
      throw new Error(`Duplicate entry for book_id ${id}`);
    }
    mockDb.books.push({
      book_id: Number(id),
      title,
      price: Number(price),
      category_id: catId ? Number(catId) : null,
      author_id: autId ? Number(autId) : null,
      availability: availability || 'Available'
    });
    addLog(`Added Book: "${title}".`);
    return { affectedRows: 1 };
  }
  if (normalizedSql.toUpperCase().includes('UPDATE BOOK SET')) {
    // We support simple update parameters mapping for editing book details
    const [title, price, catId, autId, availability, id] = params;
    const index = mockDb.books.findIndex(b => b.book_id === Number(id));
    if (index !== -1) {
      mockDb.books[index] = {
        ...mockDb.books[index],
        title,
        price: Number(price),
        category_id: catId ? Number(catId) : null,
        author_id: autId ? Number(autId) : null,
        availability: availability
      };
      addLog(`Updated Book details: "${title}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalizedSql.toUpperCase().includes('DELETE FROM BOOK')) {
    const [id] = params;
    const index = mockDb.books.findIndex(b => b.book_id === Number(id));
    if (index !== -1) {
      const title = mockDb.books[index].title;
      mockDb.books.splice(index, 1);
      addLog(`Deleted Book: "${title}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // --- CRUD FOR MEMBERS ---
  if (normalizedSql.toUpperCase().includes('INSERT INTO MEMBER')) {
    const [id, name, phone, email] = params;
    if (mockDb.members.some(m => m.member_id === Number(id))) {
      throw new Error(`Duplicate entry for member_id ${id}`);
    }
    mockDb.members.push({ member_id: Number(id), name, phone, email });
    addLog(`Registered Member: "${name}".`);
    return { affectedRows: 1 };
  }
  if (normalizedSql.toUpperCase().includes('UPDATE MEMBER')) {
    const [name, phone, email, id] = params;
    const index = mockDb.members.findIndex(m => m.member_id === Number(id));
    if (index !== -1) {
      mockDb.members[index] = { ...mockDb.members[index], name, phone, email };
      addLog(`Updated Member details: "${name}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalizedSql.toUpperCase().includes('DELETE FROM MEMBER')) {
    const [id] = params;
    const index = mockDb.members.findIndex(m => m.member_id === Number(id));
    if (index !== -1) {
      const name = mockDb.members[index].name;
      mockDb.members.splice(index, 1);
      addLog(`Removed Member: "${name}".`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // --- ISSUE & RETURN ACTIONS ---
  if (normalizedSql.toUpperCase().includes('UPDATE ISSUE SET RETURN_DATE')) {
    const [returnDate, issueId] = params;
    const index = mockDb.issues.findIndex(i => i.issue_id === Number(issueId));
    if (index !== -1) {
      const issue = mockDb.issues[index];
      issue.return_date = returnDate;
      
      // Trigger effect: Set book availability back to 'Available'
      const book = mockDb.books.find(b => b.book_id === issue.book_id);
      if (book) book.availability = 'Available';

      // Trigger effect: Calculate late fine and generate fine record
      const due = new Date(issue.due_date);
      const ret = new Date(returnDate);
      let fineAdded = '';
      if (ret > due) {
        const diffTime = Math.abs(ret - due);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const amount = diffDays * 1.50;
        
        mockDb.fines.push({
          fine_id: mockDb.fines.length + 1,
          member_id: issue.member_id,
          amount: amount,
          paid_status: 'Unpaid'
        });
        
        const member = mockDb.members.find(m => m.member_id === issue.member_id);
        fineAdded = ` Late return detected. Fine of $${amount.toFixed(2)} generated for ${member ? member.name : 'Member'}.`;
      }
      
      addLog(`[Trigger Effect] Book "${book ? book.title : 'ID ' + issue.book_id}" returned.${fineAdded} Availability changed to Available.`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // --- CRUD FOR FINES ---
  if (normalizedSql.toUpperCase().includes('UPDATE FINE SET PAID_STATUS')) {
    const [status, fineId] = params;
    const index = mockDb.fines.findIndex(f => f.fine_id === Number(fineId));
    if (index !== -1) {
      mockDb.fines[index].paid_status = status;
      const member = mockDb.members.find(m => m.member_id === mockDb.fines[index].member_id);
      addLog(`Fine ID ${fineId} for ${member ? member.name : 'Member'} marked as ${status}.`);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // --- SELECT READS / RELATIONAL QUERIES ---

  // 1. All Books
  if (normalizedSql.toUpperCase().startsWith('SELECT * FROM BOOK') || normalizedSql.toUpperCase() === 'SELECT * FROM BOOK') {
    return [mockDb.books];
  }
  // 2. Books by specific author
  if (normalizedSql.toUpperCase().includes('WHERE AUTHOR_ID = ?') && normalizedSql.toUpperCase().includes('FROM BOOK')) {
    const [authorId] = params;
    return [mockDb.books.filter(b => b.author_id === Number(authorId))];
  }
  // 3. Inner Join Queries: Get Book, Category, and Author information
  if (normalizedSql.toUpperCase().includes('INNER JOIN CATEGORY') && normalizedSql.toUpperCase().includes('INNER JOIN AUTHOR')) {
    const joined = mockDb.books.map(b => {
      const cat = mockDb.categories.find(c => c.category_id === b.category_id);
      const aut = mockDb.authors.find(a => a.author_id === b.author_id);
      return {
        book_id: b.book_id,
        title: b.title,
        price: b.price,
        category_name: cat ? cat.category_name : 'Uncategorized',
        name: aut ? aut.name : 'Unknown Author',
        availability: b.availability
      };
    });
    return [joined];
  }
  // 4. Three Table Join Queries: Join ISSUE, MEMBER, and BOOK to show details
  if (normalizedSql.toUpperCase().includes('FROM ISSUE I INNER JOIN MEMBER M') && normalizedSql.toUpperCase().includes('INNER JOIN BOOK B')) {
    const joined = mockDb.issues.map(i => {
      const member = mockDb.members.find(m => m.member_id === i.member_id);
      const book = mockDb.books.find(b => b.book_id === i.book_id);
      return {
        issue_id: i.issue_id,
        member_name: member ? member.name : 'Unknown Member',
        book_title: book ? book.title : 'Unknown Book',
        issue_date: i.issue_date,
        due_date: i.due_date,
        return_date: i.return_date
      };
    });
    return [joined];
  }
  // 5. Group By Queries: Count of books in each category
  if (normalizedSql.toUpperCase().includes('GROUP BY C.CATEGORY_NAME') && !normalizedSql.toUpperCase().includes('HAVING')) {
    const grouped = {};
    mockDb.categories.forEach(c => {
      grouped[c.category_name] = 0;
    });
    mockDb.books.forEach(b => {
      const cat = mockDb.categories.find(c => c.category_id === b.category_id);
      if (cat) {
        grouped[cat.category_name] = (grouped[cat.category_name] || 0) + 1;
      }
    });
    const result = Object.keys(grouped).map(catName => ({
      category_name: catName,
      total_books: grouped[catName]
    }));
    return [result];
  }
  // 6. Having Queries: Categories with more than 2 books
  if (normalizedSql.toUpperCase().includes('GROUP BY C.CATEGORY_NAME') && normalizedSql.toUpperCase().includes('HAVING')) {
    const grouped = {};
    mockDb.books.forEach(b => {
      const cat = mockDb.categories.find(c => c.category_id === b.category_id);
      if (cat) {
        grouped[cat.category_name] = (grouped[cat.category_name] || 0) + 1;
      }
    });
    const result = Object.keys(grouped)
      .filter(catName => grouped[catName] > 2)
      .map(catName => ({
        category_name: catName,
        total_books: grouped[catName]
      }));
    return [result];
  }
  // 7. Subqueries: Find books with price greater than the average price of all books
  if (normalizedSql.toUpperCase().includes('SELECT AVG(PRICE) FROM BOOK')) {
    const avgPrice = mockDb.books.reduce((sum, b) => sum + b.price, 0) / mockDb.books.length;
    return [mockDb.books.filter(b => b.price > avgPrice)];
  }
  // 8. Correlated Subqueries: Find books that have a price higher than the average price of books in their same category
  if (normalizedSql.toUpperCase().includes('WHERE B1.PRICE > (SELECT AVG(B2.PRICE)')) {
    const result = mockDb.books.filter(b1 => {
      const sameCatBooks = mockDb.books.filter(b2 => b2.category_id === b1.category_id);
      if (sameCatBooks.length === 0) return false;
      const catAvg = sameCatBooks.reduce((sum, b) => sum + b.price, 0) / sameCatBooks.length;
      return b1.price > catAvg;
    });
    return [result];
  }
  // 9. Left Join Queries: View all members and their issued books (even those without issues)
  if (normalizedSql.toUpperCase().includes('MEMBER M LEFT JOIN ISSUE I')) {
    const joined = [];
    mockDb.members.forEach(m => {
      const memberIssues = mockDb.issues.filter(i => i.member_id === m.member_id);
      if (memberIssues.length === 0) {
        joined.push({
          name: m.name,
          issue_id: null,
          issue_date: null
        });
      } else {
        memberIssues.forEach(i => {
          joined.push({
            name: m.name,
            issue_id: i.issue_id,
            issue_date: i.issue_date
          });
        });
      }
    });
    return [joined];
  }
  // 10. Not Exists Queries: View books that have never been issued
  if (normalizedSql.toUpperCase().includes('WHERE NOT EXISTS (SELECT 1 FROM ISSUE I')) {
    const issuedBookIds = new Set(mockDb.issues.map(i => i.book_id));
    const result = mockDb.books
      .filter(b => !issuedBookIds.has(b.book_id))
      .map(b => ({ title: b.title }));
    return [result];
  }

  // Generic Tables SELECT lists
  if (normalizedSql.toUpperCase() === 'SELECT * FROM AUTHOR') return [mockDb.authors];
  if (normalizedSql.toUpperCase() === 'SELECT * FROM CATEGORY') return [mockDb.categories];
  if (normalizedSql.toUpperCase() === 'SELECT * FROM MEMBER') return [mockDb.members];
  if (normalizedSql.toUpperCase() === 'SELECT * FROM ISSUE') return [mockDb.issues];
  if (normalizedSql.toUpperCase() === 'SELECT * FROM FINE') return [mockDb.fines];
  if (normalizedSql.toUpperCase() === 'SELECT * FROM ACTIVITY_LOGS') return [mockDb.activityLogs];

  // If a basic ID select is made (e.g. for detail views)
  if (normalizedSql.toUpperCase().includes('FROM AUTHOR WHERE AUTHOR_ID =')) {
    const id = Number(normalizedSql.match(/\d+$/)[0]);
    return [[mockDb.authors.find(a => a.author_id === id)]];
  }
  if (normalizedSql.toUpperCase().includes('FROM MEMBER WHERE MEMBER_ID =')) {
    const id = Number(normalizedSql.match(/\d+$/)[0]);
    return [[mockDb.members.find(m => m.member_id === id)]];
  }

  // Fallback default response
  return [[]];
};

// Main Query Runner supporting dual drivers
export const query = async (sql, params = []) => {
  if (useMock) {
    return runMockQuery(sql, params);
  }
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
};

export const getDbType = () => (useMock ? 'mock' : 'mysql');
export const getMockDb = () => (useMock ? mockDb : null);
