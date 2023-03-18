import http from "http";
import app from "./app.js";
import logger from "loglevel";

const setupDefaultProps = () => {
    const {
        PORT = 3000,
        HOSTNAME = '127.1.0.5',
        loglevel = "warn"
    } = process.env;

    Object.assign(process.env, {
        PORT,
        HOSTNAME,
        loglevel
    } );

};

const normalizePort = val => {
    const port = parseInt(val, 10);
    return isNaN(port) ? val : (port >= 0 ? port : false)
};

const onError = error => {

    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    logger.debug('Listening on ' + bind);
};

setupDefaultProps();

logger.setLevel(process.env.loglevel);
const port = normalizePort(process.env.PORT);
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
