import AWS from "aws-sdk";
import middy from "@middy/core";
// import validator from '@middy/validator';
// import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;
  const { status } = event.queryStringParameters;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    }
  };
  //scan and store db
  try {
    const result = await dynamodb.query(params).promise();

    auctions = result.Items;
  } catch (error){
    console.error(error);
    throw new createError.InternalServerError(error);
  }


  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = middy(getAuctions);
  // .use(
  //   validator({
  //     inputSchema: getAuctionsSchema,
  //     ajvOptions: {
  //       useDefaults: true,
  //       strict: false,
  //     },
  //   })
  // )
  // .use(httpErrorHandler());
// .use(httpJsonBodyParser())
// .use(httpEventNormalizer())
// .user(httpErrorHandler());
