const genereteResponseMessage = (code, status, message) => {
    return {
        code: code,
        status: status,
        message: message
    }
}

const generateErrorResponse = (message, data = {}) => {
    return {
        code: 500,
        status: 'error',
        message: message,
        ...data
    }
}

const generateSuccessResponse = (message, data) => {
    return {
        code: 200,
        status: 'success',
        message: message,
        ...data
    }
}

module.exports = {generateErrorResponse, genereteResponseMessage, generateSuccessResponse}