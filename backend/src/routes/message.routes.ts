import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller';
import { protect } from '../middlewares/auth.middlewares';

const router =  express.Router()

router.post("/", protect, getMessages)
router.post("/:receiver", protect, sendMessage)

export default router;
