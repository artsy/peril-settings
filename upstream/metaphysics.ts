import { danger, warn } from "danger"
import AWS from "aws-sdk"

export default async () => {
  const ecr = new AWS.ECR()
  // Grab tags, compare them
}
