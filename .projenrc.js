const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.42.0',
  defaultReleaseBranch: 'main',
  name: 'telegrambot-cdk',
  gitignore: ['config.ini', 'dependabot.yml', 'venv', 'main.test.ts.snap', '.DS_Store', 'cdk.context.json'],
  typescriptVersion: '4.6',
  minNodeVersion: '14.17.0',
  dependabot: false,
  deps: [
    '@aws-cdk/aws-apigatewayv2-alpha@2.42.0-alpha.0',
    '@aws-cdk/aws-apigatewayv2-integrations-alpha@2.42.0-alpha.0',
  ],
});
project.synth();