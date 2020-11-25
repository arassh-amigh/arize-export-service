const path = require('path');
const fs = require('fs')

exports.uploadFile = (admin , filename , directory , storageRootPath , unlink) => {
    const bucket = admin.storage().bucket()
    const directoryPath = path.join(__dirname,'..', directory)

    const storagePath = storageRootPath+filename
    const filePath = directoryPath+ '/' + filename
    const file = fs.readFileSync(filePath)

    return new Promise((resolve , reject)=>{
        bucket.file(storagePath).save(file, (error) => {
            if (error) {
                console.log('----------')
                console.log(filename)
                console.log('error in uploading')
                reject(error)
            } else {
                if(unlink) {
                    fs.unlink(filePath, (error) => {
                        if(error){ 
                            console.log('----------')
                            console.log(filename)
                            console.log('error in unlinking')
                            reject(error)
                        } else {
                            console.log('----------')
                            console.log(filename)
                            console.log('done')
                            resolve('ok')
                        }
                    });
                } else {
                    console.log('----------')
                    console.log(filename)
                    console.log('done')
                    resolve('ok')
                }
            }
        })
    })
}