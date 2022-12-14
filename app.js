var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var session = require('express-session');
var cors = require('cors');
const redisClient = require('./utils/redis');

var redisStore = require('connect-redis')(session);

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var rolesRouter = require('./routes/role');
var workflowRouter = require('./routes/workflow');
var ipfsRouter = require('./routes/ipfs');
var elasticRouter = require('./routes/elastic');

const passport = require('passport');

var form = require('./routes/form');

var app = express();

app.use(cors({
    origin: process.env.FRONTEND,
    credentials: true
}));

app.use(session({
    store: new redisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport')(passport);

app.use('/auth', authRouter)
app.use('/form', form)
app.use('/roles', rolesRouter)
app.use('/workflow', workflowRouter)
app.use('/ipfs', ipfsRouter)
app.use('/elastic', elasticRouter)
app.use('/', indexRouter);


module.exports = app;
