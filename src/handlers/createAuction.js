import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import middy from '@middy/core';
// import httpJsonBodyParser from '@middy/http-json-body-parser';
// import httpEventNormalizer from '@middy/http-event-normalizer';
// import httpErrorHandler from '@middy/http-error-handler';
// import createError from 'http-errors'; //create http error in declaractive way

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
    const {title} = JSON.parse(event.body);
    const {highestBid} = JSON.parse(event.body);
    const now = new Date();
    const endDate = new Date();
    const { email } = event.requestContext.authorizer;
    endDate.setHours(now.getHours() + 1);

    const auction = {
        id: uuid(),
        title,
        status: 'OPEN',
        createdAt: now.toISOString(),
        endingAt: endDate.toISOString(),
        highestBid: {
            amount: highestBid.amount,
        },
        seller: email,
    };

    try {
        await dynamodb.put({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Item: auction,
        }).promise();
    } catch(error) {
        console.error(error);
        throw error;
    }

    // await dynamodb.put({
    //     TableName: process.env.AUCTIONS_TABLE_NAME,
    //     Item: auction,
    // }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify(auction),
    };
}

export const handler = middy(createAuction);
    // .use(httpJsonBodyParser())
    // .use(httpEventNormalizer())
    // .user(httpErrorHandler());