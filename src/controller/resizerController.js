const Router = require("express").Router()
const path = require('path')
const fs = require("fs")
const sharp = require('sharp')
const Str = require('@supercharge/strings')
const { generateErrorResponse, generateSuccessResponse } = require("../func/generateMessage")

const MEDIUM_FOLDER_QUALITY = "medium"
const NORMAL_FOLDER_QUALITY = "normal"
const HIGH_FOLDER_QUALITY = "high"
const WEBP_FOLDER_QUALITY = "webp"
const NOT_FOUND_FILE = "notFound.png"
const PATH_TO_FILE = "libs/files"
const PATH_TO_IMAGE = path.join(PATH_TO_FILE, "images")
const HASH_SIZE = 8
const HASH_PREFIX = "guihon_"
const MEDIUM_SIZE = 240
const NORMAL_SIZE = 700
const WEBP_EXTENSION = ".webp"

const assetFolder = path.resolve(PATH_TO_IMAGE)

const mediumFolder = path.join(assetFolder, MEDIUM_FOLDER_QUALITY)
const normalFolder = path.join(assetFolder, NORMAL_FOLDER_QUALITY)
const highFolder = path.join(assetFolder, HIGH_FOLDER_QUALITY)

const webpFolder = path.join(assetFolder, WEBP_FOLDER_QUALITY)

const mediumFolderWebp = path.join(assetFolder, WEBP_FOLDER_QUALITY, MEDIUM_FOLDER_QUALITY)
const normalFolderWebp = path.join(assetFolder, WEBP_FOLDER_QUALITY, NORMAL_FOLDER_QUALITY)
const highFolderWebp = path.join(assetFolder, WEBP_FOLDER_QUALITY, HIGH_FOLDER_QUALITY)

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

        if (quality == NORMAL_FOLDER_QUALITY) {
            image = path.resolve(normalFolder, imageName)
        }

        if (quality == HIGH_FOLDER_QUALITY) {
            image = path.resolve(highFolder, imageName)
        }
    }

    console.log(image)
    if(fs.existsSync(image)){
        res.type = path.extname(image)

        res.status(200).sendFile(path.resolve(image))

    }else{
        res.type = path.extname(notFound)
        res.status(404).sendFile(notFound)
    }
})

Router.post("/upload", async (req, res)=>{
    req.pipe(req.busboy)
    if (req.busboy) {
        req.busboy.on('file', async(_name, file, info) => {
            const fileName = info.filename
            const fileExtension = path.extname(fileName)
            const hanshName = HASH_PREFIX + Str.random(HASH_SIZE / 2) + Date.now() + Str.random(HASH_SIZE / 2)
            const customFileName = hanshName + fileExtension 
            const customFileName_webp = hanshName + WEBP_EXTENSION
            const filePath = path.join(highFolder, customFileName)
            
            file.pipe(fs.createWriteStream(filePath)).on("finish", async() => {
                await sharp(path.join(filePath))
                    .webp()
                    .toFile(path.resolve(highFolderWebp, customFileName_webp))
            })

            req.busboy.on('finish', async() => {
                await sharp(filePath)
                    .resize(NORMAL_SIZE)
                    .toFile(path.resolve(normalFolder, customFileName))
                    .then(async (_buffer)=>{
                        await sharp(path.join(normalFolder, customFileName))
                        .webp()
                        .toFile(path.resolve(normalFolderWebp, customFileName_webp))

                        await sharp(filePath)
                            .resize(MEDIUM_SIZE)
                            .toFile(path.resolve(mediumFolder, customFileName))
                            .then(async (_buffer) => {
                                await sharp(path.join(mediumFolder, customFileName))
                                    .webp()
                                    .toFile(path.resolve(mediumFolderWebp, customFileName_webp))
                                res.status(200).json(generateSuccessResponse("File uploaded successfully", { file: customFileName }))

                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json(generateErrorResponse('Error on resize image'))
                            })
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json(generateErrorResponse('Error on resize image'))
                    })
                })
            })

            req.busboy.on('error', (err) => {
                console.log(err)
                res.status(500).json(generateErrorResponse('Error on uploading file'))
            })
    }
})


module.exports = Router

