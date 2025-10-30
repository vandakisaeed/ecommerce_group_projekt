import { Router } from 'express';
import { login, signup, logout, refresh, getMe ,updateUser ,deleteUser} from '#controllers';
import { requireAuth } from '#middlewares';

const authRouter = Router();

// Public routes
authRouter.post('/login', login);
authRouter.post('/signup', signup);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);

// Protected routes
authRouter.get('/me', requireAuth, getMe);
authRouter.patch('/update', requireAuth, updateUser);
authRouter.delete('/delete', requireAuth, deleteUser);
export { authRouter };
