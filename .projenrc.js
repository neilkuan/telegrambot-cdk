const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.91.0',
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkTypeScriptApp',
  name: 'telegrambot-cdk',
  cdkDependencies: [
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-ecr',
    '@aws-cdk/aws-apigatewayv2',
    '@aws-cdk/aws-apigatewayv2-integrations',
    '@aws-cdk/aws-logs',
  ],
  dependabot: false,
});
const ignore = ['config.ini', 'dependabot.yml', 'venv', 'main.test.ts.snap', '.DS_Store', 'cdk.context.json'];
project.gitignore.exclude(...ignore);
project.synth();
