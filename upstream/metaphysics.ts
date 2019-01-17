import { danger, warn } from "danger"
import { ECR } from "aws-sdk"

const ecr = new ECR()

const resolveSHA1ForTag = (tag: string) => {
  return new Promise((resolve, reject) => {
    const re = new RegExp("^[0-9a-f]{40}$")
    ecr.describeImages({repositoryName: 'metaphysics',
                        imageIds: [{imageTag: tag}]},
    (err, data) => {
        if (err) {
            reject(err)
        } else {
          if (data.imageDetails.length != 1) {
            reject(new Error(`Found multiple images matching tag "${tag}"`))
          }
          data.imageDetails[0].imageTags.forEach((imageTag) => {
              if (re.test(imageTag)) {
                  resolve(imageTag)
              }
          })
          reject(new Error(`Cound not find a Git-SHA1 tag for image "${data.imageDetails[0].imageDigest}"`))
        }
    })
  })
}

export const productionSHA1 = async () => {
  return await resolveSHA1ForTag('production')
}

export const stagingSHA1 = async () => {
  return await resolveSHA1ForTag('staging')
}
