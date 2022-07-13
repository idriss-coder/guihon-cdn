const spliter = (str, separator) => {
    return str.split(separator);
}

const getNameFile = (str) => {
    return spliter(str, '.')[0];
}

const getOptimizeFile = (str) => {
    return getNameFile(str) + '.webp';
}

module.exports = {spliter, getNameFile, getOptimizeFile};