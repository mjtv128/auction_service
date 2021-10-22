import AWS from "aws-sdk";
import middy from "@middy/core";
import { getAuctionById } from "./getAuction";
// import createError from 'http-errors'; //create http error in declaractive way


const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = JSON.parse(event.body);
  const auction = await getAuctionById(id);

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
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
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
