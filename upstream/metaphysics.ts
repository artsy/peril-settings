import { danger, warn } from "danger"
import { ECR } from "aws-sdk"

const resolveSHA1ForTag = (ecr: ECR, tag: string) => {
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

export default async () => {
  const ecr = new ECR()
  let productionSHA1
  try {
    productionSHA1 = await resolveSHA1ForTag(ecr, 'production')
    return await danger.github.utils.fileContents("_schema.graphql", `artsy/metaphysics`, productionSHA1)
  } catch(err) {
    console.log(err)
    return null
  }
}
