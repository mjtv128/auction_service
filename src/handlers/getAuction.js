import AWS from "aws-sdk";
import middy from "@middy/core";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id){
  let auction;

  try{
    const result = await dynamodb.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: {id},
    }).promise();

    auction = result.Item;
  } catch(error){
    console.error(error);
  }

  if (!auction){
    return {
      statusCode: 400,
      message: `Auction id ${id} cannot be found`,
    };
  }
  return auction;
}

async function getAuction(event, context) {
  const {id} = event.pathParameters;
  const auction = await getAuctionById(id);
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = middy(getAuction);
// .use(httpJsonBodyParser())
// .use(httpEventNormalizer())
// .user(httpErrorHandler());
