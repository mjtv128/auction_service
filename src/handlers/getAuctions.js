import AWS from "aws-sdk";
import middy from "@middy/core";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  //scan and store db
  try {
    const result = await dynamodb.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME
    }).promise();

    auctions = result.Items;
  } catch (error){
    console.error(error);
    throw new Error('Error', error);
  }


  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = middy(getAuctions);
// .use(httpJsonBodyParser())
// .use(httpEventNormalizer())
// .user(httpErrorHandler());
