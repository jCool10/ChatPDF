import AWS from 'aws-sdk'
import fs from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { NotFoundError } from '~/core/error.response'

const createStoreDir = async (fileKey: string) => {
  const fileName = path.join(tmpdir(), 'chat-pdf', fileKey)
  await fs.mkdir(fileName, { recursive: true }, (err) => {
    if (err) console.error(err)
    else console.log('Data written to file successfully.')
  })
  return fileName
}

AWS.config.update({
  accessKeyId: 'AKIAYM74Q4TZY27GS3FW',
  secretAccessKey: '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',
  region: 'ap-southeast-1'
})

const s3 = new AWS.S3()

export async function downloadFromS3(file_key: string) {
  console.log('file_key', file_key)
  const params = {
    Bucket: 'chatpdf-nckh',
    Key: `${file_key}`
  }
  const obj = await s3.getObject(params).promise()

  if (!obj) throw new NotFoundError('Not found file')

  const tempDir = path.join(await createStoreDir('uploads'))
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
  }

  const filePath = path.join(tempDir, file_key)
  console.log(filePath)
  fs.writeFileSync(filePath, obj.Body as Buffer)
  return filePath
}
