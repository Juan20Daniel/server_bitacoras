const fs = require('fs/promises');
const path = require('path');

const removeImg = async (imageName, urlFragment='public/temp') => {
    try {
        const imagePath = path.join(process.cwd(), `${urlFragment}`, imageName);

        await fs.unlink(imagePath);
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const moveImg = async (file, folderName) => {
    const imagePath = path.join(process.cwd(), `public/images/${folderName}`, file.filename);
    
    await fs.rename(file.path, imagePath);
}

module.exports = {
    removeImg,
    moveImg
}