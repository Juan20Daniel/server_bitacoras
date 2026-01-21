const path = require('path');

const get = (req, res, next) => {
    const { imageName } = req.params;
    const folderName = req.uploadFolder;
    const imagePath = path.join(process.cwd(), `public/images/${folderName}`, imageName);

    res.sendFile(imagePath, err => {
        if(err) {
            next(err);
        }
    });
}

module.exports = {
    get
}