const { Router } = require('express');
const router = Router();
const checkAuth = require('../middleware/check-auth');
const { getUsers, createUser, authUser } = require('../controllers/users.controller');

router.get('/users', checkAuth, getUsers);
router.post('/user', createUser);
router.post('/login', authUser);

module.exports = router;