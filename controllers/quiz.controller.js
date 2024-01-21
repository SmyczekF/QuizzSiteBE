const sequelize = require('../database/sequelize-initializer');

const getAll = async function(req, res){
    try{
        const order = req.query.order || ['finished', 'DESC'];
        const genreName = req.params.genreName;
        const page = req.query.page || 1
        const limit = req.query.limit || 10

        const quizzes = await sequelize.models.Quiz.findAll({
            include: [
                {model: sequelize.models.User, attributes: ['username']},
                {
                    model: sequelize.models.Genre,
                    where: {name: genreName},
                    attributes: [], // Exclude Genre attributes from the result
                    through: {attributes: []} // Exclude many-to-many relation attributes
                }
            ],
            offset: (page - 1) * limit,
            limit: limit,
            order: [order]
        });
        const totalCount = await sequelize.models.Quiz.count({
            include: {
                model: sequelize.models.Genre,
                where: {name: genreName}
            }
        });
        
        res.send({
            quizzes: quizzes,
            totalCount: totalCount
        });
    } catch(err){
        console.log(err)
        res.status(500).send('Internal server error')
    }
}

const get = async function(req, res){
    try{
        if(req.params.quizID === undefined){
            res.status(400).send('Bad request')
            return
        }
        const quiz = await sequelize.models.Quiz.findOne({
            where: {
                id: req.params.quizID
            },
            include: [
                {model: sequelize.models.Question, include: {
                    model: sequelize.models.Option, attributes: ['text', 'order', 'image']}
                },
                {model: sequelize.models.User, attributes: ['username']},
                {model: sequelize.models.Genre, attributes: ['name'], through: {attributes: []}}
            ]
        })
        if(quiz){
            res.send(quiz)
        }else{
            res.status(404).send('Quiz not found')
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send('Internal server error')
    }
}

const createQuiz = async function(req, res){
    try{
        const questions = req.body.questions;
        const genres = req.body.genres;

        if(!genres || !questions){
            res.status(400).send('No questions or genres provided')
            return null;
        }

        const quiz = await sequelize.models.Quiz.findOne({
            where: {
                title: req.body.title
            }
        })
        if(quiz){
            res.status(409).send('Quiz with that name already exists')
        } else if(!req.session || !req.session.user || !req.session.user.username){
            res.status(401).send('Unauthorized')
        }
        else{
            const user = await sequelize.models.User.findOne({
                where: {
                    username: req.session.user.username
                }
            })
            if(!user){
                res.status(404).send('User not found')
                return
            }
            const newQuiz = await sequelize.models.Quiz.create({...req.body, UserId: user.id})
            
            
            questions.forEach(async question => {
                const newQuestion = await sequelize.models.Question.create(question)
                await newQuiz.addQuestion(newQuestion)

                const options = question.options;
                options.forEach(async option => {
                    const newOption = await sequelize.models.Option.create(option)
                    await newQuestion.addOption(newOption)
                })
            })
            genres.forEach(async genre => {
                const [newGenre, created]  = await sequelize.models.Genre.findOrCreate({
                    where: {
                        name: genre
                    },
                    defaults: {name: genre}
                })
                await newQuiz.addGenre(newGenre)
            })
            res.send(newQuiz)
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send('Internal server error')
    }
}

const updateQuiz = async function(req, res){
    try{
        if(req.params.quizID === undefined){
            res.status(400).send('Bad request')
            return
        }
        const quiz = await sequelize.models.Quiz.findOne({
            where: {
                id: req.params.quizID
            }
        })

        if(quiz){
            const updatedQuiz = await sequelize.models.Quiz.update(req.body, {
                where: {
                    id: req.params.quizID
                }
            })

            const questions = req.body.questions;
            const genres = req.body.genres;
            if(questions){
                questions.forEach(async question => {
                    const updatedQuestion = await sequelize.models.Question.update(question, {
                        where: {
                            id: question.id
                        }
                    })
                    updateQuiz.addQuestion(updatedQuestion)

                    const options = question.options;
                    options.forEach(async option => {
                        const updatedOption = await sequelize.models.Option.update(option, {
                            where: {
                                id: option.id
                            }
                        })
                        updatedQuestion.addOption(updatedOption)
                    })
                })
                res.send(updatedQuiz)
            }

            if(genres){
                genres.forEach(async genre => {
                    const updatedGenre = await sequelize.models.Genre.update(genre, {
                        where: {
                            id: genre.id
                        }
                    })
                    updatedQuiz.addGenre(updatedGenre)
                })
                res.send(updatedQuiz)
            }
        }else{
            res.status(404).send('Quiz not found')
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send('Internal server error')
    }
}

const deleteQuiz = async function(req, res){
    try{
        if(req.params.quizID === undefined){
            res.status(400).send('Bad request')
            return
        }
        const quiz = await sequelize.models.Quiz.findOne({
            where: {
                id: req.params.quizID
            }
        })

        if(quiz){
            await sequelize.models.Quiz.destroy({
                where: {
                    id: req.params.quizID
                }
            })
            res.send('Quiz deleted')
        }else{
            res.status(404).send('Quiz not found')
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send('Internal server error')
    }
}

module.exports = {
    getAll,
    get,
    createQuiz,
    updateQuiz,
    deleteQuiz
}