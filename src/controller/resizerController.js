const Router = require("express").Router()
const path = require('path')
const fs = require("fs")
const sharp = require('sharp')

const MEDIUM_FOLDER_QUALITY = "medium"
const NORMAL_QUALITY = "normal"
const NOT_FOUND_FILE = "notFound.png"
const PATH_TO_FILE = "libs/files"

const assetFolder = path.resolve(PATH_TO_FILE)
const mediumFolder = path.join(assetFolder, MEDIUM_FOLDER_QUALITY)

Router.get("/:image", (req, res) => {
    const query = req.query
    const params = req.params
    
    const notFound = path.resolve(assetFolder, NOT_FOUND_FILE)

    const imageName = params.image
    const quality = query.quality

    let image = path.join(mediumFolder, imageName)

    if(quality){
        if (quality == MEDIUM_FOLDER_QUALITY){
            image = path.join(mediumFolder, imageName)
        }

        if (quality == NORMAL_QUALITY) {
            image = path.resolve(assetFolder, imageName)
        }
    }

    console.log(image)
    if(fs.existsSync(image)){
        res.type = path.extname(image)
        res.status(200).sendFile(image)
    }else{
        res.type = path.extname(notFound)
        res.status(404).sendFile(notFound)
    }
})

Router.post("/upload", (req, res)=>{
    const query = req.query
    const params = req.params
    const body = req.body

    console.log(body)
    console.log(params)
    console.log(query)

    res.status(200).json({
        status: 200,
        message: "file has been uploaded"
    })
})

module.exports = Router

