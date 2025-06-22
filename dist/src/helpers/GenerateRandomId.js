"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueOrderTracker = exports.generateRandomAlphanumeric = void 0;
const crypto_1 = __importDefault(require("crypto"));
const GenerateRandomId = () => {
    const randomSegment = crypto_1.default.randomBytes(4).toString("hex");
    const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${dateSegment}${randomSegment}`;
};
exports.default = GenerateRandomId;
const generateRandomAlphanumeric = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};
exports.generateRandomAlphanumeric = generateRandomAlphanumeric;
const generateUniqueOrderTracker = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 36 chars
    const randomPart = Array(3)
        .fill(0)
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join('');
    const timestamp = Date.now().toString(36).slice(-3);
    return `${randomPart}${timestamp}`;
};
exports.generateUniqueOrderTracker = generateUniqueOrderTracker;
const uniqueString = (0, exports.generateUniqueOrderTracker)();
console.log(uniqueString); // Example output: "aB7df5"
