import { Router } from 'express';
import { getUsers, deleteUser } from '../controller/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.delete('/:id', deleteUser);

export default router;
