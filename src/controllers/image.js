const {handleError} = require('../utils/error');
const path = require('path');

const get = (req, res, next) => {
    const { imageName } = req.params;
    const folderName = req.uploadFolder;
    const imagePath = path.join(process.cwd(), `public/images/${folderName}`, imageName);

    res.sendFile(imagePath, error => {
        if(error) {
            next(new handleError('Error al obtener la imagen', error));
        }
    });
}

module.exports = {
    get
}