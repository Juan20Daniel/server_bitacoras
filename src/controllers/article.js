const { Article, ArticleEntryHistory, ArticleOutputHistory } = require('../models');
const { handleError } = require("../utils/error");
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { moveImg, removeImg } = require('../utils/file');
const { normalizeQueryParams } = require('../utils/queryParams');

const createCode = async () => {
    const lastArticle = await Article.findOne({
        attributes:['code'],
        order:[['id', 'DESC']]
    });
    if(!lastArticle) {
        return '1000';
    }
    
    const lastCode = +lastArticle.code;
    return `${lastCode+1}`;
}

const getArticleById = async (id) => {
    const equipment = await Article.findOne({
        attributes: [
            'id', 
            'image', 
            'name', 
            'quantity', 
            'code', 
            'unit', 
            'observations',
            'createdAt',
            'bill',
            'department_id'
        ],
        where:{
            id:id,
            active:true
        }
    });

    return equipment;
}


const articlesByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const page =  normalizeQueryParams(req.query.page);
        const pageSize = 20;

        const articles = await Article.findAll({
            attributes: [
                'id', 
                'image', 
                'name', 
                'quantity', 
                'code', 
                'unit', 
                'observations',
                'createdAt',
                'bill',
                'department_id'
            ],
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: {
                department_id:departmentId,
                active:true
            }
        });
        
        res.status(201).json({
            message: 'Lista de material',
            pageSize: pageSize,
            nextPage: page+1,
            articles: articles,
        });
    } catch (error) {
        next(new handleError('Error al obtener los materiales', "SERVER_ERR"));
    }
}

const addArticle = async (req, res, next) => {
    try {
        const {
           articleName,
           quantity,
           unit,
           observations,
           bill,
           departmentId
        } = req.body;
        let image = null;
        if(req.file) {
            image = req.file.filename;
        }
        console.log(req.body);
        const code = await createCode();
       
        const data = {
            image: image,
            name: articleName,
            quantity: quantity,
            code: code,
            unit: unit,
            observations: observations,
            bill:bill,
            department_id: departmentId
        }

        if(!data.image) delete data.image;

        const result = await sequelizeConfig.transaction(async (transaction) => {
            const article = await Article.create(
                data,
                {transaction}
            );

            await ArticleEntryHistory.create(
                {
                    quantity:quantity,
                    article_id:article.id
                },
                {transaction}
            );

            return article;
        });

        if(req.file) {
            await moveImg(req.file, req.uploadFolder);
        }

        const article = await getArticleById(result.id)

        res.status(201).json({
            message: 'Material agregado.',
            article: article
        });
    } catch (error) {
        console.log(error);
        if(req.file) await removeImg(req.file.filename);
        next(new handleError('Error al agregar el equipo', "SERVER_ERR"));
    }
}

const registerArticleEntry = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { quantity } = req.body;

        await ArticleEntryHistory.create({quantity, article_id:articleId});

        res.status(201).json({
            message: 'Entrada de material registrada.',
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al registrar entrada de material', "SERVER_ERR"));
    }
}

const registerArticleOutput = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { quantity } = req.body;

        await ArticleOutputHistory.create({quantity, article_id:articleId});

        res.status(201).json({
            message: 'Salida de material registrada.',
        });
    } catch (error) {
        console.log(error);
        next(new handleError('Error al registrar entrada de material', "SERVER_ERR"));
    }
}


const edithArticle = async (req, res, next) => {
    try {
        if(!req.body) {
            return res.status(201).json({
                message: 'No hay datos para editar.'
            });
        }
        const { equipmentId } = req.params;
        const data = {
            own: req.body.own??false,
            fixed_asset_type: req.body.fixedAssetType??false,
            clasification: req.body.clasification??false,
            brand: req.body.brand??false,
            model: req.body.model??false,
            state: req.body.state??false,
            quantity: req.body.quantity??false,
            observations: req.body.observations??false
        }
        for(const field in data) {
            if(!data[field]) delete data[field];
        }
       
        const currentEquipment = await getEquipmentById(equipmentId);
        
        if(!currentEquipment) {
            if(req.file) await removeImg(req.file.filename);
            next(new handleError('Equipo no encontrado.', "NOT_FOUND_ERR"));
        }
        if(currentEquipment.image && req.body.removeImage === 'true') {
            await removeImg(currentEquipment.image, 'public/images/equipment/');
        } 
        if(req.file) {
            data.image = req.file.filename;
        }
        if(!req.file && req.body.removeImage === 'true') {
            data.image = null;
        } 
        await sequelizeConfig.transaction(async (transaction) => {

            await Equipment.update(
                data,
                {where:{id:currentEquipment.id}},
                {transaction}
            );
        });

        if(req.file) {
            await moveImg(req.file, req.uploadFolder);
        }

        const equipmentUpdated = await getEquipmentById(equipmentId);

        res.status(201).json({
            message: 'Equipo editado.',
            equipment:equipmentUpdated
        });
    } catch (error) {
        console.log(error);
        if(req.file) await removeImg(req.file.filename);
        next(new handleError('Error al editar el equipo', "SERVER_ERR"));
    }
}

const inactiveArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        
        await Article.update(
            {active:false},
            {where:{id:articleId}}
        );

        res.status(201).json({
            message: 'Material inactivado',
        });
    } catch (error) {
        next(new handleError('Error al inctivar el material', "SERVER_ERR"));
    }
}

module.exports = {
    addArticle,
    articlesByDepartment,
    registerArticleEntry,
    registerArticleOutput,
    edithArticle,
    inactiveArticle
}