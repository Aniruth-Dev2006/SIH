// Logger utility for consistent logging across the application

const logLevels = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m', // Magenta
    RESET: '\x1b[0m'
};

class Logger {
    constructor() {
        this.enabled = true;
    }

    log(level, message, data = null) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const color = colors[level] || colors.RESET;
        const logMessage = `${color}[${timestamp}] [${level}]${colors.RESET} ${message}`;

        console.log(logMessage);
        if (data) {
            console.log(data);
        }
    }

    error(message, error = null) {
        this.log(logLevels.ERROR, message, error);
    }

    warn(message, data = null) {
        this.log(logLevels.WARN, message, data);
    }

    info(message, data = null) {
        this.log(logLevels.INFO, message, data);
    }

    debug(message, data = null) {
        this.log(logLevels.DEBUG, message, data);
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}

module.exports = new Logger();
