import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import middy from "@middy/core";

export const nonNullPathParam = (param?: string): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
    const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
        request
    ): Promise<void | APIGatewayProxyResult> => {
        if(!request.event.pathParameters) {
            console.error('Event object or path parameters are missing')
            return {
                statusCode: 400,
                body: 'Event object or path parameters are missing.',
            }
        }

        if (!!param && !request.event.pathParameters[param]) {
            console.error('Path parameter not defined', param)
            return {
                statusCode: 400,
                body: `Path parameter is required: ${param}`,
            }
        }
    }

    return {
        before,
    }
}
