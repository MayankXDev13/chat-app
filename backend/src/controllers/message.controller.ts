import { Request, Response } from "express";
import Message from "../models/message.model";
import { AuthRequest } from "../middlewares/auth.middlewares";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { receiver, content } = req.body;

  if (!receiver || !content) {
    return res
      .status(400)
      .json({ message: "Receiver and content are required" });
  }

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiver,
      message: content,
    });
    return res
      .status(201)
      .json({ message: "Message sent successfully", data: message });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "failed to send message", error: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const { receiver } = req.params;

  if (!receiver) {
    return res.status(400).json({ message: "Receiver is required" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiver },
        { sender: receiver, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    return res
      .status(200)
      .json({ message: "Messages fetched successfully", data: messages });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "failed to fetch messages", error: error.message });
  }
};
