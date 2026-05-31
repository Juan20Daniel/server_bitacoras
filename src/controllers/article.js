const { Article, ArticleEntryHistory, ArticleOutputHistory, Department, Camp } = require('../models');
const { handleError } = require("../utils/error");
const { sequelizeConfig } = require('../database/sequelizeConfig');
const { moveImg, removeImg } = require('../utils/file');
const { normalizeQueryParams } = require('../utils/queryParams');
const { Op } = require('sequelize');

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
            'active'
        ],
        include: [
            {
                model:Department,
                attributes: [
                    'id',
                    'name',
                    'inventory_type',
                    'createdAt',
                    'active'
                ],
                include: [
                    {
                        model:Camp,
                        attributes:['id', 'city', 'school_type', 'active'],
                        as:'camp'
                    }
                ],
                as:'department'
            }
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
                'active'
            ],
            include: [
                {
                    model:Department,
                    attributes: [
                        'id',
                        'name', 
                        'inventory_type', 
                        'createdAt',  
                        'active'
                    ],
                    include: [
                        {
                            model:Camp,
                            attributes:['id', 'city', 'school_type', 'active'],
                            as:'camp'
                        }
                    ],
                    as:'department'
                }
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

const statusArticle = async (req, res, next) => {
    try {
        const totalArticles = await Article.count({
            where:{
                active:true
            }
        });
        const withoutStock = await Article.count({
            where:{
                quantity:0,
                active:true
            }
        });

        res.status(200).json({
            message: 'Status de material',
            status: {
                totalArticles: totalArticles,
                withoutStock: withoutStock
            }
        });
    } catch (error) {
        next(new handleError('Error al obtener el estatus de los materiales', "SERVER_ERR"));
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

        const code = await createCode();
       
        const data = {
            image: image,
            name: articleName,
            quantity: quantity,
            code: code,
            unit: unit,
            observations: observations,
            department_id: departmentId
        }

        if(!data.image) delete data.image;

        const result = await sequelizeConfig.transaction(async (transaction) => {
            const article = await Article.create(
                data,
                {transaction}
            );
            if(Number(quantity)) {
                await ArticleEntryHistory.create(
                    {
                        quantity:quantity,
                        article_id:article.id,
                        bill:bill,
                    },
                    {transaction}
                );
            }

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
//Continuar con usar esta api  en el front
const registerArticleEntry = async (req, res, next) => {
    try {
        const { articleCode } = req.params;
        const { quantity, bill } = req.body;
        const article = await Article.findOne({
            attributes:['id', 'quantity'],
            where: {code:articleCode}
        });

        await sequelizeConfig.transaction(async (transaction) => {
            await ArticleEntryHistory.create(
                {quantity, article_id:article.id, bill},
                {transaction}
            );

            await Article.update(
                {quantity:parseInt(article.quantity, 10) + parseInt(quantity, 10)},
                {
                    where: {id:article.id},
                    transaction
                }
            );
        });
        
        
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
        const { articleId } = req.params;
        const data = {
            name: req.body.articleName??false,
            unit: req.body.unit??false,
            quantity: req.body.quantity??false,
            bill: req.body.bill??false,
        }
        
        for(const field in data) {
            if(!data[field]) delete data[field];
        }

        const currentArticle = await getArticleById(articleId);
        
        if('observations' in req.body && req.body.observations !== currentArticle.observations) {
            data.observations = req.body.observations === '' 
                ? null 
                : req.body.observations;
        }

        if(!currentArticle) {
            if(req.file) await removeImg(req.file.filename);
            next(new handleError('Material no encontrado.', "NOT_FOUND_ERR"));
        }
        if(currentArticle.image && req.body.removeImage === 'true') {
            await removeImg(currentArticle.image, `public/images/${req.uploadFolder}/`);
        } 
        if(req.file) {
            data.image = req.file.filename;
        }
        if(!req.file && req.body.removeImage === 'true') {
            data.image = null;
        } 
       
        await Article.update(
            data,
            {where:{id:articleId}},
        );

        const articleUpdated = await getArticleById(articleId);
        
        if(req.file) {
            await moveImg(req.file, req.uploadFolder);
        }

        res.status(201).json({
            message: 'Material editado.',
            article: articleUpdated
        });
    } catch (error) {
        console.log(error);
        if(req.file) await removeImg(req.file.filename);
        next(new handleError('Error al editar el material', "SERVER_ERR"));
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

const searchArticle = async (req, res, next) => {
    try {
        const { searchBy, query } = req.query;
        
        const attributes = [
            'id',
            'image',
            'name',
            'quantity',
            'code',
            'unit',
            'observations',
            'createdAt',
            'active'
        ];

        const includes = [
            {
                model:Department,
                attributes: [
                    'id',
                    'name', 
                    'inventory_type', 
                    'createdAt', 
                    'active',
                ],
                include: [
                    {
                        model:Camp,
                        attributes:['id', 'city', 'school_type', 'active'],
                        as:'camp'
                    }
                ],
                as:'department'
            }
        ]

        if(searchBy==='code') {
            const article = await Article.findOne({
                attributes:attributes,
                include:includes,
                where:{code:query}
            });
    
            return res.status(200).json({
                message:'Resultados de la busqueda de material por código.',
                articles:[article]
            });
        }

        const articles = await Article.findAll({
            attributes:attributes,
            include:includes,
            where:{name:{
                [Op.like]:`%${query}%`
            }}
        });

        res.status(200).json({
            message:'Resultados de la busqueda de material por nombre',
            articles:articles??[]
        });
    } catch (error) {
        next(new handleError('Error al buscar el material.', "SERVER_ERR"));
    }
}

module.exports = {
    addArticle,
    articlesByDepartment,
    statusArticle,
    registerArticleEntry,
    registerArticleOutput,
    edithArticle,
    inactiveArticle,
    searchArticle
}