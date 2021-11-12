import AWS from "aws-sdk";
import middy from "@middy/core";
import { getAuctionById } from "./getAuction";


const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = JSON.parse(event.body);
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  // if (email === auction.seller){
  //   const response = {
  //     statusCode: 400,
  //     body: JSON.stringify(`You cannot bid on your own auctions`),
  //   };
  //   return response;
  // }

  if (email === auction.highestBid.bidder) {
    const response = {
      statusCode: 400,
      body: JSON.stringify(`You are already the highest bidder`),
    };
    return response;
  }

  if (auction.status !== 'OPEN'){
      const response = {
        statusCode: 400,
        body: JSON.stringify(
          `You cannot bid on closed auctions`
        ),
      };
      return response;
  }

  if (amount <= auction.highestBid.amount){
    const response = {
      statusCode: 400,
      body: JSON.stringify(`Your bid must be higher than the current bid $${auction.highestBid.amount}`),
    };
    return response;
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch(error){
    console.error(error);
    // throw new Error("Internal Server Error1");
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middy(placeBid);
