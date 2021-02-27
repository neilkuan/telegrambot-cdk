import * as path from 'path';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2';
import * as _lambda_integ from '@aws-cdk/aws-apigatewayv2-integrations';
import * as _lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);
    const stack = cdk.Stack.of(this);
    if (process.env.TELEGRAM_TOKEN === undefined || process.env.URLTOKEN === undefined ) {
      cdk.Annotations.of(stack).addError('Please export ENV VAR TELEGRAM_TOKEN or URLTOKEN');
    }
    const customAlpineECR = new _lambda.DockerImageFunction(this, 'customAlpineECR', {
      code: _lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../apps')),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        TELEGRAM_TOKEN: `${process.env.TELEGRAM_TOKEN}`,
        URLTOKEN: `${process.env.URLTOKEN}`,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const app2 = new _lambda_integ.LambdaProxyIntegration({ handler: customAlpineECR });
    const api = new apigatewayv2.HttpApi(this, 'API');
    api.addRoutes({
      path: '/hook',
      methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.POST, apigatewayv2.HttpMethod.OPTIONS],
      integration: app2,
    });
    new cdk.CfnOutput(this, 'URL', { value: `${api.url!}` });
  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
new MyStack(app, 'telegramBot', { env: devEnv });

app.synth();