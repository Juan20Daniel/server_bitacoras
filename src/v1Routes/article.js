const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article');
const { 
    upload, 
    authorize, 
    auth, 
    setUploadFolder,
    validateField,
} = require('../middlewares');

router.get('/by-department/:departmentId',
    auth,
    authorize(['operator','admin']),
    validateField('departmentId'),
    articleController.articlesByDepartment
);

router.get('/search',
    auth,
    authorize(['operator','admin']),
    validateField('searchBy'),
    validateField('query'),
    articleController.searchArticle
);

router.post('/',
    auth,
    authorize(['operator','admin']),
    setUploadFolder('articles'),
    upload.single('image'),
    validateField('articleName'),
    validateField('quantity'),
    validateField('unit'),
    validateField('observations', false),
    validateField('bill'),
    validateField('departmentId'),
    articleController.addArticle
);


router.patch('/:articleId', 
    auth,
    authorize(['operator','admin']),
    setUploadFolder('articles'),
    upload.single('image'),
    validateField('articleName', false),
    validateField('unit', false),
    validateField('quantity', false),
    validateField('bill', false),
    validateField('observations', false),
    validateField('removeImage'),
    articleController.edithArticle
);

router.delete('/:articleId',
    auth,
    authorize(['operator','admin']),
    validateField('articleId'),
    articleController.inactiveArticle
);

module.exports = router;