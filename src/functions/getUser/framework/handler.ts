import middy from '@middy/core';
import warmup from "@middy/warmup";
import errorLogger from "@middy/error-logger";
import httpSecurityHeaders from "@middy/http-security-headers";
import cors from '@middy/http-cors';
import inputOutputLogger from "@middy/input-output-logger";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {nonNullPathParam} from "../middleware/NotNullPathParam";
import {injectLambdaContext, Logger} from "@aws-lambda-powertools/logger";
import {captureLambdaHandler, Tracer} from "@aws-lambda-powertools/tracer";
import {isWarmingUp} from "../lib/IsWarmingUp";
import httpEventNormalizer from "@middy/http-event-normalizer";
import {LogItemMessage} from "@aws-lambda-powertools/logger/lib/types";
import {getUser} from "../service/UserService";

const opts = { serviceName: 'serverless-middy-pattern' };
export const logger = new Logger(opts);
export const tracer = new Tracer(opts);

async function baseHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        await getUser(event.pathParameters?.staffNumber as string);

        return {
            statusCode: 200,
            body: JSON.stringify({})
        } as APIGatewayProxyResult;

    } catch (err) {
        if (err instanceof Error && err.message === 'User not found') {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            } as APIGatewayProxyResult;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        } as APIGatewayProxyResult;
    }
}

export const handler = middy(baseHandler)
    .use(warmup({isWarmingUp}))
    .use(inputOutputLogger({awsContext: true}))
    .use(nonNullPathParam('staffNumber'))
    .use(errorLogger())
    .use(httpSecurityHeaders())
    .use(cors())
    .use(httpEventNormalizer())
    .use(injectLambdaContext(logger))
    .use(captureLambdaHandler(tracer));
