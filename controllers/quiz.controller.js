const sequelize = require('../database/sequelize-initializer');

const getAll = async function(req, res){
    try{
        const page = req.query.page || 1
        const limit = req.query.limit || 10

        const quizzes = await sequelize.models.Quiz.findAll({
            include: {model: sequelize.models.User, attributes: ['username']},
            offset: (page - 1) * limit,
            limit: limit
        });
        const totalCount = await sequelize.models.Quiz.count()
        
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
                {model: sequelize.models.Question, include: sequelize.models.Option},
                {model: sequelize.models.User, attributes: ['username']}
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
            const newQuiz = await sequelize.models.Quiz.create({
                title: req.body.title,
                description: req.body.description,
                image: req.body.image,
                liked: req.body.liked,
                finished: req.body.finished,
                color: req.body.color,
                UserId: user.id
            })
            

            const questions = req.body.questions;
            questions.forEach(async question => {
                const newQuestion = await sequelize.models.Question.create({
                    text: question.question,
                    image: question.image,
                    type: question.type,
                    order: question.order,
                })
                await newQuiz.addQuestion(newQuestion)

                const options = question.options;
                options.forEach(async option => {
                    const newOption = await sequelize.models.Option.create({
                        text: option.option,
                        image: option.image,
                        isCorrect: option.correct,
                        order: option.order,
                    })
                    await newQuestion.addOption(newOption)
                })
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
            const updatedQuiz = await sequelize.models.Quiz.update({
                title: req.body.title,
                description: req.body.description,
                image: req.body.image,
                liked: req.body.liked,
                finished: req.body.finished,
                color: req.body.color,
            }, {
                where: {
                    id: req.params.quizID
                }
            })

            const questions = req.body.questions;
            questions.forEach(async question => {
                const updatedQuestion = await sequelize.models.Question.update({
                    question: question.question,
                    image: question.image,
                    type: question.type,
                    order: question.order,
                }, {
                    where: {
                        id: question.id
                    }
                })
                updateQuiz.addQuestion(updatedQuestion)

                const options = question.options;
                options.forEach(async option => {
                    const updatedOption = await sequelize.models.Option.update({
                        option: option.option,
                        image: option.image,
                        correct: option.correct,
                        order: option.order,
                    }, {
                        where: {
                            id: option.id
                        }
                    })
                    updatedQuestion.addOption(updatedOption)
                })
            })
            res.send(updatedQuiz)
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