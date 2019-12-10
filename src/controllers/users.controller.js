const { Pool } = require('pg');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'node',
    password: 'Cris2019',
    max: 20,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0
});

const getUsers = (req, res) => {
    pool.query('SELECT * FROM users')
        .then( result => res.status(200).json({ users: result.rows }))
        .catch( err => console.log(err)
    );
};

const createUser = (req, res) => {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    pool.query('SELECT email FROM users WHERE email = $1', [user.email])
        .then(result => {
            if(result.rowCount >= 1) throw new Error(`User already exist`);
            return bcrypt.hash(user.password, 10);
        })
        .then(hashed => pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING email', [user.name, user.email, hashed]))
        .then(result => {
            return res.status(201).json({
                message: 'User has been created!', 
                email: result.rows[0].email
            });
        })
        .catch(err => {
            console.log('Catching the error: ', err.message);
            res.status(404).json({
                message: err.message
            });
        }
    );
};

const authUser = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    pool.query('SELECT email, password FROM users WHERE email = $1', [user.email])
        .then(result => {
            if( result.rowCount !== 1) throw new Error(`User does not exist.`);
            return bcrypt.compare(user.password, result.rows[0].password)
        })
        .then(result => {
            if(!result) throw new Error(`Incorrect password.`);
            
            // Create token with JWT
            jwt.sign({email: user.email}, 'hello_world', { expiresIn: 60 }, (err, token) => {
                if (err) throw new Error(`Token failed to create.`);
                return res.status(200).json({ 
                    message: 'Logged In!, Let\'s get you set up.',
                    token: token
                });
            });
        })
        .catch( err=> {
            console.log('Catching the error: ', err.message);
            res.status(404).json({
                message: err.message
            });
        });
};

module.exports = {
    getUsers,
    createUser,
    authUser
}