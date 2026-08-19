const express = require('express');
const router = express.Router();
const fs = require('fs');

const pathRouter = `${__dirname}`;

const removeExtrnsion = (fileName) => {
    return fileName.split('.').shift();
}

fs.readdirSync(pathRouter).filter((file) => {
    const fileWithoutExt = removeExtrnsion(file);
    const skip = ['index'].includes(fileWithoutExt);
    if (!skip) {
        router.use(`/${fileWithoutExt}`, require(`./${fileWithoutExt}`));
    }
});

module.exports = router;