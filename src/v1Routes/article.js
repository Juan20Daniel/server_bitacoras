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

router.get('/status',
    auth,
    authorize(['operator','admin']),
    articleController.statusArticle
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
    validateField('bill', false),
    validateField('departmentId'),
    articleController.addArticle
);

router.post('/register-entry',
    auth,
    authorize(['operator','admin']),
    validateField('articleCode'),
    validateField('quantity'),
    validateField('bill', false),
    articleController.registerArticleEntry
);

router.post('/register-output',
    auth,
    authorize(['operator','admin']),
    validateField('employeeId'),
    validateField('articleCode'),
    validateField('quantity'),
    articleController.registerArticleOutput
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