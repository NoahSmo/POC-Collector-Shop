import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { 
  createOrGetChatRoom, 
  getUserChatRooms, 
  getChatRoomMessages, 
  sendMessage 
} from '../controllers/chat.controller';

const router = Router();

router.use(requireAuth);

router.post('/rooms', createOrGetChatRoom);
router.get('/rooms', getUserChatRooms);
router.get('/rooms/:roomId/messages', getChatRoomMessages);
router.post('/rooms/:roomId/messages', sendMessage);

export default router;
