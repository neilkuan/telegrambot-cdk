import * as path from 'path';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as lambda_integ from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);
    const stack = cdk.Stack.of(this);
    if (process.env.TELEGRAM_TOKEN === undefined || process.env.URLTOKEN === undefined ) {
      cdk.Annotations.of(stack).addError('Please export ENV VAR TELEGRAM_TOKEN or URLTOKEN');
    }
    const customAlpineECR = new lambda.DockerImageFunction(this, 'customAlpineECR', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../apps'), {
        platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
      }),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        TELEGRAM_TOKEN: `${process.env.TELEGRAM_TOKEN}`,
        URLTOKEN: `${process.env.URLTOKEN}`,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const app2 = new lambda_integ.HttpLambdaIntegration('customAlpineECR', customAlpineECR );
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
  region: 'us-east-1',
};

const app = new cdk.App();
new MyStack(app, 'telegramBot', { env: devEnv });

app.synth();