const Router = require("express").Router()
const path = require('path')
const fs = require("fs")
const sharp = require('sharp')
const Str = require('@supercharge/strings')
const { generateErrorResponse, generateSuccessResponse } = require("../func/generateMessage")
const { getOptimizeFile } = require("../func/spliter")

const IMG_EXT_ARRAY = ["jpg", "webp", "png", "gif", "jpeg"]
const VIDEO_EXT_ARRAY = ["mp4", "mkv", "mov", "avi"]

const MEDIUM_FOLDER_QUALITY = "medium"
const NORMAL_FOLDER_QUALITY = "normal"
const HIGH_FOLDER_QUALITY = "high"
const WEBP_FOLDER_QUALITY = "webp"
const LOW_FOLDER_QUALITY = "low"

const LOW_FOLDER_VIDEO_QUALITY = "low"
const HD_FOLDER_VIDEO_QUALITY = "hd"
const FHD_FOLDER_VIDEO_QUALITY = "fhd"

const NOT_FOUND_FILE = "notFound.png"
const PATH_TO_FILE = "libs/files"

const PATH_TO_IMAGE = path.join(PATH_TO_FILE, "images")
const PATH_TO_VIDEO = path.join(PATH_TO_FILE, "video")

const HASH_SIZE = 8
const HASH_PREFIX = "guihon_"

const MEDIUM_SIZE = 240
const NORMAL_SIZE = 700
const LOW_SIZE = 36

const WEBP_EXTENSION = ".webp"

const assetFolder = path.resolve(PATH_TO_IMAGE)

const lowFolder = path.join(assetFolder, LOW_FOLDER_QUALITY)
const mediumFolder = path.join(assetFolder, MEDIUM_FOLDER_QUALITY)
const normalFolder = path.join(assetFolder, NORMAL_FOLDER_QUALITY)
const highFolder = path.join(assetFolder, HIGH_FOLDER_QUALITY)

const lowVideoFolder = path.join(assetFolder, LOW_FOLDER_VIDEO_QUALITY)
const hdVideoFolder = path.join(assetFolder, HD_FOLDER_VIDEO_QUALITY)
const fhdVideoFolder = path.join(assetFolder, FHD_FOLDER_VIDEO_QUALITY)

const webpFolder = path.join(assetFolder, WEBP_FOLDER_QUALITY)
const lowFolderWebp = path.join(webpFolder, LOW_FOLDER_QUALITY)
const mediumFolderWebp = path.join(webpFolder, MEDIUM_FOLDER_QUALITY)
const normalFolderWebp = path.join(webpFolder, NORMAL_FOLDER_QUALITY)
const highFolderWebp = path.join(webpFolder, HIGH_FOLDER_QUALITY)



Router.get("/:image", (req, res) => {
    const query = req.query
    const params = req.params
    
    const notFound = path.resolve(assetFolder, NOT_FOUND_FILE)

    const imageName = params.image
    const quality = query.quality
    const compressed = query.compressed

    let image = path.join(mediumFolder, imageName)


    if(quality){
        const webpName = getOptimizeFile(imageName)

        if (quality == MEDIUM_FOLDER_QUALITY){
            image = compressed ? path.join(mediumFolderWebp, webpName) : path.join(mediumFolder, imageName)
        }
        
        if (quality == NORMAL_FOLDER_QUALITY) {
            image = compressed ? path.resolve(normalFolderWebp, webpName) : path.resolve(normalFolder, imageName)
        }

        if (quality == HIGH_FOLDER_QUALITY) {
            image = compressed ? path.resolve(highFolderWebp, webpName) : path.resolve(highFolder, imageName)
        }

        if(quality == LOW_FOLDER_QUALITY){
            image = compressed ? path.resolve(lowFolderWebp, webpName) : path.resolve(lowFolder, imageName)
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

Router.post("/upload", async (req, res) => {
    req.pipe(req.busboy)
    if (req.busboy) {
        req.busboy.on('file', async (_name, file, info) => {
            const fileName = info.filename
            const fileExtension = path.extname(fileName)
            const hanshName = HASH_PREFIX + Str.random(HASH_SIZE / 2) + Date.now() + Str.random(HASH_SIZE / 2)
            const customFileName = hanshName + fileExtension
            const customFileName_webp = hanshName + WEBP_EXTENSION
            const filePath = path.join(highFolder, customFileName)

            let progress = 0
            let reader = file
            let writer = fs.createWriteStream(filePath)

            reader.on("data", (chunk) => {
                progress += chunk.length

            })

            reader.pipe(writer)

            if(fileExtension in IMG_EXT_ARRAY){
                reader.on("end", async () => {
                    console.log(`Generating optimised file`)
                    await sharp(path.join(filePath))
                        .webp()
                        .toFile(path.resolve(highFolderWebp, customFileName_webp))

                })

                req.busboy.on('finish', async () => {
                    await sharp(filePath)
                        .resize(NORMAL_SIZE)
                        .toFile(path.resolve(normalFolder, customFileName))
                        .then(async (_buffer) => { }).catch(err => {
                            console.log(err)
                            res.status(500).json(generateErrorResponse('Error on resize image to normal quality', err))
                        })

                    await sharp(path.join(normalFolder, customFileName))
                        .webp()
                        .toFile(path.resolve(normalFolderWebp, customFileName_webp))

                    await sharp(filePath)
                        .resize(MEDIUM_SIZE)
                        .toFile(path.resolve(mediumFolder, customFileName))
                        .then(async (_buffer) => { })
                        .catch(err => {
                            console.log(err)
                            res.status(500).json(generateErrorResponse('Error on resize image to medium quality', err))
                        })

                    await sharp(path.join(mediumFolder, customFileName))
                        .webp()
                        .toFile(path.resolve(mediumFolderWebp, customFileName_webp))

                    await sharp(path.join(mediumFolder, customFileName))
                        .resize(LOW_SIZE)
                        .toFile(path.resolve(lowFolder, customFileName))

                    await sharp(path.join(lowFolder, customFileName))
                        .webp()
                        .toFile(path.resolve(lowFolderWebp, customFileName_webp))

                    console.log(`${customFileName} uploaded and resized sussefully`)

                    res.status(200).json(generateSuccessResponse("File uploaded successfully", { file: customFileName }))
                })

                console.log(`upload of ${fileName} is complete`)
                
            }else if(fileExtension in VIDEO_EXT_ARRAY){
                
            }

        })

        req.busboy.on('error', (err) => {
            console.log(err)
            res.status(500).json(generateErrorResponse('Error on uploading file'))
        })
    }
})

Router.delete("/:image", (req, res) => {
    const params = req.params
    const imageName = params.image
    const webpVersion = getOptimizeFile(imageName)

    if (fs.existsSync(path.resolve(highFolder, imageName))){
        fs.unlinkSync(path.join(lowFolder, imageName))
        fs.unlinkSync(path.join(lowFolderWebp, webpVersion))

        fs.unlinkSync(path.join(mediumFolder, imageName))
        fs.unlinkSync(path.join(mediumFolderWebp, webpVersion))

        fs.unlinkSync(path.join(normalFolder, imageName))
        fs.unlinkSync(path.join(normalFolderWebp, webpVersion))

        fs.unlinkSync(path.join(highFolder, imageName))
        fs.unlinkSync(path.join(highFolderWebp, webpVersion))


        
        res.status(200).json(generateSuccessResponse("Image deleted"))
    }else{
        res.status(404).json(generateErrorResponse("Image not found"))
    }
})

module.exports = Router

