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
exports.getMessages = exports.sendMessage = void 0;
const message_model_1 = __importDefault(require("../models/message.model"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver, content } = req.body;
    if (!receiver || !content) {
        return res
            .status(400)
            .json({ message: "Receiver and content are required" });
    }
    try {
        const message = yield message_model_1.default.create({
            sender: req.user._id,
            receiver: receiver,
            message: content,
        });
        return res
            .status(201)
            .json({ message: "Message sent successfully", data: message });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "failed to send message", error: error.message });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver } = req.params;
    if (!receiver) {
        return res.status(400).json({ message: "Receiver is required" });
    }
    try {
        const messages = yield message_model_1.default.find({
            $or: [
                { sender: req.user._id, receiver: receiver },
                { sender: receiver, receiver: req.user._id },
            ],
        }).sort({ createdAt: 1 });
        return res
            .status(200)
            .json({ message: "Messages fetched successfully", data: messages });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "failed to fetch messages", error: error.message });
    }
});
exports.getMessages = getMessages;
