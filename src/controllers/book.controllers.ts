// import { Request, Response } from 'express';
// import { v4 as uuidv4 } from 'uuid';



// class BookController {
//   static getAllBooks(req: Request, res: Response): Response {
//     return res.json(books);
//   }

//   static getBookById(req: Request, res: Response): Response {
//     const book = books.find(b => b.id === req.params.id);
//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     return res.json(book);
//   }

//   static createBook(req: Request, res: Response): Response {
//     const { title, author, year } = req.body;
//     if (!title || !author || !year) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }
//     const newBook: Book = {
//       id: uuidv4(),
//       title,
//       author,
//       year: parseInt(year)
//     };
//     books.push(newBook);
//     return res.status(201).json(newBook);
//   }

//   static updateBook(req: Request, res: Response): Response {
//     const bookIndex = books.findIndex(b => b.id === req.params.id);
//     if (bookIndex === -1) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     const { title, author, year } = req.body;
//     if (!title || !author || !year) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }
//     books[bookIndex] = { ...books[bookIndex], title, author, year: parseInt(year) };
//     return res.json(books[bookIndex]);
//   }

//   static deleteBook(req: Request, res: Response): Response {
//     const bookIndex = books.findIndex(b => b.id === req.params.id);
//     if (bookIndex === -1) {
//       return res.status(404).json({ message: 'Book not found' });
//     }
//     const deletedBook = books.splice(bookIndex, 1);
//     return res.json(deletedBook[0]);
//   }
// }