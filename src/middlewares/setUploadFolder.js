const setUploadFolder = (folderName) => {
    return (req, res, next) => {
        req.uploadFolder = folderName;
        next();
    }
}

module.exports = {
    setUploadFolder
}