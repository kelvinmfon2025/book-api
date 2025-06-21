import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

interface Book {
  id: number;
  title: string;
  author: string;
}

let books: Book[] = [];
let nextId = 1;

// GET /api/books - Get all books
app.get('/api/books', (_req: Request, res: Response) => {
  res.json(books);
});

// GET /api/books/:id - Get a book by ID
app.get('/api/books/:id', (req: Request, res: Response ) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

// POST /api/books - Create a new book
app.post('/api/books', (req: Request, res: Response) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  const newBook: Book = {
    id: nextId++,
    title,
    author
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT /api/books/:id - Update a book
app.put('/api/books/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  book.title = title;
  book.author = author;

  res.json(book);
});

// DELETE /api/books/:id - Delete a book
app.delete('/api/books/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books.splice(index, 1);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(` 😃 Books API running at http://localhost:${PORT}`);
});
 