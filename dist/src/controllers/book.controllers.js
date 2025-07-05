"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBorrowedBooks = exports.returnBook = exports.borrowBook = exports.deleteBook = exports.updateBook = exports.getSpecificBook = exports.getAllBooks = exports.createBook = void 0;
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const AppResponse_1 = __importDefault(require("../helpers/AppResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const book_model_1 = require("../model/book.model");
// This controller handles  books
exports.createBook = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, authors, isbn, publisher, publicationYear, genres, language, totalCopies, availableCopies, location, description, coverImage, } = req.body;
        // Validate required fields
        if (!title ||
            !authors ||
            !isbn ||
            !genres ||
            !totalCopies ||
            availableCopies === undefined) {
            return next(new AppError_1.default("Missing required fields", 400));
        }
        const newBook = new book_model_1.BookModel({
            title,
            authors,
            isbn,
            publisher,
            publicationYear,
            genres,
            language,
            totalCopies,
            availableCopies,
            location,
            description,
            coverImage,
        });
        yield newBook.save();
        return (0, AppResponse_1.default)(res, "Book created successfully", 201, newBook);
    }
    catch (error) {
        console.error("Error creating book:", error);
        return next(new AppError_1.default("Failed to create book", 500));
    }
}));
exports.getAllBooks = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.getSpecificBook = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.updateBook = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.deleteBook = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
//KAZEEM
//         Sprint 3: Borrowing System Endpoints
// POST /api/borrow - Borrow a book (member only, updates User.borrowedBooks and Book.availableCopies).
// POST /api/return/:borrowId - Return a borrowed book (member only, updates User.borrowedBooks and Book.availableCopies).
// GET /api/users/:id/borrowed - Get a user’s borrowed books (authenticated user for their own books, admin/librarian for any user).
exports.borrowBook = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.returnBook = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.getUserBorrowedBooks = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
