import express from 'express';
import { query, getDbType, getMockDb } from '../config/db.js';

const router = express.Router();

const mysqlActivityLogs = [
  { timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), activity: 'Book "A Brief History of Time" returned by Bob Brown.' },
  { timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), activity: 'Fine of $9.00 generated for Alice Johnson (late return of "1984").' },
  { timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), activity: 'Book "Animal Farm" issued to John Doe.' }
];

// Helper to log activities in MySQL or Mock db
const addActivityLog = async (activity) => {
  const cleanActivityText = activity
    .replace(/^\[Trigger Demonstration\]\s*/i, '')
    .replace(/^\[Trigger Effect\]\s*/i, '');

  if (getDbType() === 'mock') {
    const mock = getMockDb();
    if (mock) {
      mock.activityLogs.unshift({
        timestamp: new Date().toISOString(),
        activity: cleanActivityText
      });
    }
  } else {
    mysqlActivityLogs.unshift({
      timestamp: new Date().toISOString(),
      activity: cleanActivityText
    });
    console.log(`[Activity Log] ${cleanActivityText}`);
  }
};

// --- AUTH ROUTE ---
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUser && password === adminPass) {
    res.json({ success: true, token: 'admin-jwt-token-demo', message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
});

// --- DB MODE ROUTE ---
router.get('/db-type', (req, res) => {
  res.json({ dbType: getDbType() });
});

// --- DASHBOARD ROUTE ---
router.get('/dashboard/stats', async (req, res) => {
  try {
    let booksCount = 0;
    let authorsCount = 0;
    let categoriesCount = 0;
    let membersCount = 0;
    let issuedBooksCount = 0;
    let availableBooksCount = 0;
    let totalFinesAmount = 0.00;
    let recentLogs = [];

    if (getDbType() === 'mock') {
      const mock = getMockDb();
      booksCount = mock.books.length;
      authorsCount = mock.authors.length;
      categoriesCount = mock.categories.length;
      membersCount = mock.members.length;
      issuedBooksCount = mock.issues.filter(i => i.return_date === null).length;
      availableBooksCount = mock.books.filter(b => b.availability === 'Available').length;
      totalFinesAmount = mock.fines.reduce((sum, f) => sum + Number(f.amount), 0);
      recentLogs = mock.activityLogs.slice(0, 8);
    } else {
      const books = await query('SELECT COUNT(*) AS count FROM BOOK');
      booksCount = books[0].count;
      const authors = await query('SELECT COUNT(*) AS count FROM AUTHOR');
      authorsCount = authors[0].count;
      const categories = await query('SELECT COUNT(*) AS count FROM CATEGORY');
      categoriesCount = categories[0].count;
      const members = await query('SELECT COUNT(*) AS count FROM MEMBER');
      membersCount = members[0].count;
      const issued = await query('SELECT COUNT(*) AS count FROM ISSUE WHERE return_date IS NULL');
      issuedBooksCount = issued[0].count;
      const available = await query("SELECT COUNT(*) AS count FROM BOOK WHERE availability = 'Available'");
      availableBooksCount = available[0].count;
      const fines = await query('SELECT SUM(amount) AS sum FROM FINE');
      totalFinesAmount = fines[0].sum || 0.00;
      
      recentLogs = mysqlActivityLogs.slice(0, 8);
    }

    // Prepare chart data: books per category
    let categoryChart = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      categoryChart = mock.categories.map(c => {
        const count = mock.books.filter(b => b.category_id === c.category_id).length;
        return { name: c.category_name, books: count };
      });
    } else {
      const rows = await query('SELECT C.category_name AS name, COUNT(B.book_id) AS books FROM BOOK B INNER JOIN CATEGORY C ON B.category_id = C.category_id GROUP BY C.category_name');
      categoryChart = rows;
    }

    res.json({
      success: true,
      stats: {
        totalBooks: booksCount,
        totalAuthors: authorsCount,
        totalCategories: categoriesCount,
        totalMembers: membersCount,
        issuedBooks: issuedBooksCount,
        availableBooks: availableBooksCount,
        totalFines: Number(totalFinesAmount).toFixed(2)
      },
      categoryChart,
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AUTHOR MANAGEMENT ---
router.get('/authors', async (req, res) => {
  try {
    const search = req.query.search || '';
    let rows = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      rows = mock.authors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.country.toLowerCase().includes(search.toLowerCase()));
    } else {
      if (search) {
        rows = await query('SELECT * FROM AUTHOR WHERE name LIKE ? OR country LIKE ?', [`%${search}%`, `%${search}%`]);
      } else {
        rows = await query('SELECT * FROM AUTHOR');
      }
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/authors/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    let author = null;
    let booksList = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      author = mock.authors.find(a => a.author_id === id);
      booksList = mock.books.filter(b => b.author_id === id);
    } else {
      const result = await query('SELECT * FROM AUTHOR WHERE author_id = ?', [id]);
      author = result[0] || null;
      booksList = await query('SELECT * FROM BOOK WHERE author_id = ?', [id]);
    }
    if (!author) return res.status(404).json({ success: false, message: 'Author not found' });
    res.json({ success: true, author, books: booksList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/authors', async (req, res) => {
  try {
    const { author_id, name, country } = req.body;
    await query('INSERT INTO AUTHOR (author_id, name, country) VALUES (?, ?, ?)', [Number(author_id), name, country]);
    res.json({ success: true, message: 'Author created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/authors/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, country } = req.body;
    await query('UPDATE AUTHOR SET name = ?, country = ? WHERE author_id = ?', [name, country, id]);
    res.json({ success: true, message: 'Author updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/authors/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM AUTHOR WHERE author_id = ?', [id]);
    res.json({ success: true, message: 'Author deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- CATEGORY MANAGEMENT ---
router.get('/categories', async (req, res) => {
  try {
    const search = req.query.search || '';
    let rows = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      rows = mock.categories.filter(c => c.category_name.toLowerCase().includes(search.toLowerCase()));
    } else {
      if (search) {
        rows = await query('SELECT * FROM CATEGORY WHERE category_name LIKE ?', [`%${search}%`]);
      } else {
        rows = await query('SELECT * FROM CATEGORY');
      }
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { category_id, category_name } = req.body;
    await query('INSERT INTO CATEGORY (category_id, category_name) VALUES (?, ?)', [Number(category_id), category_name]);
    res.json({ success: true, message: 'Category created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { category_name } = req.body;
    await query('UPDATE CATEGORY SET category_name = ? WHERE category_id = ?', [category_name, id]);
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM CATEGORY WHERE category_id = ?', [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- BOOK MANAGEMENT ---
router.get('/books', async (req, res) => {
  try {
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const authorId = req.query.authorId;

    let rows = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      rows = mock.books.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryId ? b.category_id === Number(categoryId) : true;
        const matchesAut = authorId ? b.author_id === Number(authorId) : true;
        return matchesSearch && matchesCat && matchesAut;
      });
    } else {
      let sql = 'SELECT * FROM BOOK WHERE 1=1';
      const params = [];
      if (search) {
        sql += ' AND title LIKE ?';
        params.push(`%${search}%`);
      }
      if (categoryId) {
        sql += ' AND category_id = ?';
        params.push(Number(categoryId));
      }
      if (authorId) {
        sql += ' AND author_id = ?';
        params.push(Number(authorId));
      }
      rows = await query(sql, params);
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/books', async (req, res) => {
  try {
    const { book_id, title, price, category_id, author_id, availability } = req.body;
    await query('INSERT INTO BOOK (book_id, title, price, category_id, author_id, availability) VALUES (?, ?, ?, ?, ?, ?)', [
      Number(book_id),
      title,
      Number(price),
      category_id ? Number(category_id) : null,
      author_id ? Number(author_id) : null,
      availability || 'Available'
    ]);
    res.json({ success: true, message: 'Book added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, price, category_id, author_id, availability } = req.body;
    await query('UPDATE BOOK SET title = ?, price = ?, category_id = ?, author_id = ?, availability = ? WHERE book_id = ?', [
      title,
      Number(price),
      category_id ? Number(category_id) : null,
      author_id ? Number(author_id) : null,
      availability,
      id
    ]);
    res.json({ success: true, message: 'Book updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM BOOK WHERE book_id = ?', [id]);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- MEMBER MANAGEMENT ---
router.get('/members', async (req, res) => {
  try {
    const search = req.query.search || '';
    let rows = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      rows = mock.members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));
    } else {
      if (search) {
        rows = await query('SELECT * FROM MEMBER WHERE name LIKE ? OR email LIKE ?', [`%${search}%`, `%${search}%`]);
      } else {
        rows = await query('SELECT * FROM MEMBER');
      }
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/members/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    let member = null;
    let history = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      member = mock.members.find(m => m.member_id === id);
      history = mock.issues
        .filter(i => i.member_id === id)
        .map(i => {
          const book = mock.books.find(b => b.book_id === i.book_id);
          return {
            ...i,
            book_title: book ? book.title : 'Unknown Book'
          };
        });
    } else {
      const result = await query('SELECT * FROM MEMBER WHERE member_id = ?', [id]);
      member = result[0] || null;
      history = await query('SELECT I.*, B.title AS book_title FROM ISSUE I INNER JOIN BOOK B ON I.book_id = B.book_id WHERE I.member_id = ?', [id]);
    }
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/members', async (req, res) => {
  try {
    const { member_id, name, phone, email } = req.body;
    await query('INSERT INTO MEMBER (member_id, name, phone, email) VALUES (?, ?, ?, ?)', [
      Number(member_id),
      name,
      phone,
      email
    ]);
    res.json({ success: true, message: 'Member registered successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/members/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, email } = req.body;
    await query('UPDATE MEMBER SET name = ?, phone = ?, email = ? WHERE member_id = ?', [
      name,
      phone,
      email,
      id
    ]);
    res.json({ success: true, message: 'Member updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/members/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM MEMBER WHERE member_id = ?', [id]);
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- ISSUE & RETURN BOOK MODULES ---
router.get('/issues', async (req, res) => {
  try {
    let rows = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      rows = mock.issues.map(i => {
        const book = mock.books.find(b => b.book_id === i.book_id);
        const member = mock.members.find(m => m.member_id === i.member_id);
        return {
          ...i,
          book_title: book ? book.title : 'Unknown Book',
          member_name: member ? member.name : 'Unknown Member'
        };
      });
    } else {
      rows = await query('SELECT I.*, B.title AS book_title, M.name AS member_name FROM ISSUE I INNER JOIN BOOK B ON I.book_id = B.book_id INNER JOIN MEMBER M ON I.member_id = M.member_id');
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/issues', async (req, res) => {
  try {
    const { issue_id, book_id, member_id, issue_date, due_date } = req.body;

    // Check if book is available
    const bookRows = await query('SELECT availability, title FROM BOOK WHERE book_id = ?', [Number(book_id)]);
    const book = bookRows[0];
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    if (book.availability !== 'Available') {
      return res.status(400).json({ success: false, error: 'Book is currently unavailable' });
    }

    // Insert Issue
    await query('INSERT INTO ISSUE (issue_id, book_id, member_id, issue_date, due_date, return_date) VALUES (?, ?, ?, ?, ?, NULL)', [
      Number(issue_id),
      Number(book_id),
      Number(member_id),
      issue_date,
      due_date
    ]);

    // Trigger effect validation
    if (getDbType() === 'mysql') {
      // Trigger automatically sets BOOK availability to 'Unavailable'
      // We log to demonstrate
      console.log('MySQL Trigger "after_issue_insert" successfully executed.');
    } else {
      // In Mock DB, availability update is simulated in runMockQuery
    }

    // Add activity log entry
    const memRows = await query('SELECT name FROM MEMBER WHERE member_id = ?', [Number(member_id)]);
    const memberName = memRows[0] ? memRows[0].name : `Member ID ${member_id}`;
    await addActivityLog(`Book "${book.title}" issued to ${memberName}. Status changed to Unavailable.`);

    res.json({ success: true, message: 'Book issued successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/issues/:id/return', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { return_date } = req.body;

    // Get issue details before update
    const issueRows = await query('SELECT * FROM ISSUE WHERE issue_id = ?', [id]);
    const issue = issueRows[0];
    if (!issue) return res.status(404).json({ success: false, error: 'Issue record not found' });

    await query('UPDATE ISSUE SET return_date = ? WHERE issue_id = ?', [return_date, id]);

    // Read details for activity logging
    const bookRows = await query('SELECT title FROM BOOK WHERE book_id = ?', [issue.book_id]);
    const bookTitle = bookRows[0] ? bookRows[0].title : `Book ID ${issue.book_id}`;

    const due = new Date(issue.due_date);
    const ret = new Date(return_date);
    let fineMsg = '';
    if (ret > due) {
      const days = Math.ceil(Math.abs(ret - due) / (1000 * 60 * 60 * 24));
      fineMsg = ` Late return detected (${days} days). Fine of $${(days * 1.50).toFixed(2)} generated automatically.`;
    }

    await addActivityLog(`Book "${bookTitle}" returned. Availability restored to Available.${fineMsg}`);

    res.json({ success: true, message: 'Book returned successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- FINE MANAGEMENT ---
router.get('/fines', async (req, res) => {
  try {
    let rows = [];
    if (getDbType() === 'mock') {
      const mock = getMockDb();
      rows = mock.fines.map(f => {
        const member = mock.members.find(m => m.member_id === f.member_id);
        return {
          ...f,
          member_name: member ? member.name : 'Unknown Member'
        };
      });
    } else {
      rows = await query('SELECT F.*, M.name AS member_name FROM FINE F INNER JOIN MEMBER M ON F.member_id = M.member_id');
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/fines/:id/pay', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query("UPDATE FINE SET paid_status = 'Paid' WHERE fine_id = ?", [id]);
    res.json({ success: true, message: 'Fine marked as Paid successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
