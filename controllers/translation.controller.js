const fs = require('fs')

const getTranslations = async function(req, res){
    const languageID = req.params.languageID
    const routeID = req.params.routeID
    if(languageID === undefined || !!routeID === undefined){
        res.status(400).send('Bad request')
        return
    }
    if(!fs.existsSync(`./translations/${routeID}/${languageID}.json`)){
        res.status(404).send('Language not found')
        return
    }

    res.send(require(`../translations/${routeID}/${languageID}.json`))
}
    

module.exports = {
    getTranslations,
}