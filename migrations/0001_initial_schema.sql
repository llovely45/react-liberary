-- Migration number: 0001 	 2024-05-24T12:00:00Z

DROP TABLE IF EXISTS BorrowRecords;
DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In production, use hashed passwords
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'reader')),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE Books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  isbn TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  publication_date TEXT, -- YYYY-MM-DD
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'lost')),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE BorrowRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  borrow_date INTEGER DEFAULT (strftime('%s', 'now')),
  return_date INTEGER, -- NULL means not returned yet
  status TEXT NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned')),
  expected_return_date INTEGER,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (book_id) REFERENCES Books(id)
);

CREATE INDEX idx_books_isbn ON Books(isbn);
CREATE INDEX idx_books_title ON Books(title);
CREATE INDEX idx_borrow_user ON BorrowRecords(user_id);
CREATE INDEX idx_borrow_book ON BorrowRecords(book_id);
