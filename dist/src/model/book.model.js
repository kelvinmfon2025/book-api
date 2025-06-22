"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        index: true, // Index for faster search
    },
    authors: {
        type: [String],
        required: [true, 'At least one author is required'],
        trim: true,
    },
    isbn: {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true,
        match: [/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits'],
    },
    publisher: {
        type: String,
        trim: true,
    },
    publicationYear: {
        type: Number,
        min: [1450, 'Publication year must be after 1450'],
        max: [new Date().getFullYear(), 'Publication year cannot be in the future'],
    },
    genres: {
        type: [String],
        required: [true, 'At least one genre is required'],
        trim: true,
    },
    language: {
        type: String,
        trim: true,
    },
    totalCopies: {
        type: Number,
        required: [true, 'Total copies is required'],
        min: [1, 'At least one copy is required'],
    },
    availableCopies: {
        type: Number,
        required: [true, 'Available copies is required'],
        min: [0, 'Available copies cannot be negative'],
        validate: {
            validator: function (value) {
                return value <= this.totalCopies;
            },
            message: 'Available copies cannot exceed total copies',
        },
    },
    location: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    coverImage: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});
exports.BookModel = mongoose_1.default.model('Book', bookSchema);
