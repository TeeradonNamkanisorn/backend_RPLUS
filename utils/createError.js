module.exports =  (message, statusCode) => {
    const err = new Error(message);
    if (statusCode) err.statusCode = statusCode;
    throw err;
}