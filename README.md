# Zoom Notifier For Slack
AWS Lambda function that ingests webhooks from Zoom and sends them to Slack

## General explanation
There is already a Zoom app for Slack. Using that app you can create meetings, join meetings, make calls, etc. If that is all you desire to do, just use that app.

But if you want notifications about other things (like room controller disconnections, camera disconnections, etc), the existing Zoom app for Slack is not going to be much help to you. This repository contains code and instructions for setting up your own Zoom app and Slack app to send Zoom notifications to channels in your Slack workspace.

The general flow of information is
- Zoom -> AWS lambda function -> Slack 
  - Zoom will send a webhook event whenever something happens
  - The lambda function will receive the event, format it in a way that Slack will understand, then sends it to Slack
  - Slack receives the event and posts it to a channel defined by you

## Setup
You'll be configuring things in reverse order of how events will propagate. 

In order for the Zoom app to know where to send webhooks events, the lambda function has to be configured.

In order for the lambda function to know where to sent webhook events, the Slack app has to be configured.

### Slack App
- In a browser, go to https://api.slack.com/
- If you don't already have an account, create one
- Sign in
- Click "Create an app"
- Select "From scratch"
- Name your app (I named mine "Zoom Notifier")
- Select the Slack workspace that you will use the app in
- Click "Create App"
- In the "Add features and functionality" section, click on "Incoming Webhooks"
- Activate incoming webhooks by turning the toggle on
- Create webhook endpoint
    - Click "Add New Webhook to Workspace"
    - Select the channel that your app will post to
    - Click "Allow"
    - *Note: you can create multiple webhook endpoints. To do so, just repeat the steps above.* 
- You will now have a webhook URL (or multiple if you created multiple). You will use this in the setup of your AWS lambda function.

### AWS Lambda function
- In `index.js`, replace the value of `slackEndpointForIncomingWebhooks` with the webhook URL from your Slack app.
    - If you configured multiple webhook endpoints in your Slack app, you will need to modify the lambda function logic in `index.js`. I'm going to assume that you know what you're doing. If not, you should probably just stick to one webhook endpoint.
- If you don't have `npm` installed on your machine, install it.
- In the root directory of this repository, run `npm install`. It will install any dependencies declared in `package.json`.
    - For now, the only dependency is axios, but that could change in the future if this lambda function is beefed up.
    - You will notice that you now have a `node_modules` directory, which should contain an `axios` directory.
- Create a zip file that contains `index.js` and the `node_modules` directory.
- In a browser, go to https://aws.amazon.com/
- If you don't already have an account, create one
- Sign in
- In the "AWS services" section of your dashboard, click on "Lambda". You may need to expand all services to find it. (It is in the "Compute" section of all services.)
- Click "Create function"
- Select "Author from scratch"
- Name your function (I named mine "zoomSlackNotifier")
- Choose "Node.js" as your runtime
- Click "Create function"
- You will be taken to the function page for your newly created function
- Click the "Upload from" dropdown on the right side (about middle of the page down)
- Select ".zip file"
- Choose the zip file that you created earlier (containing `index.js` and the `node_modules` directory)
- You should now see the function inside the "Code source" editor
- In the "Function overview" section at the top of the page, click "+ Add trigger"
- In the dropdown, select "API Gateway"
- Select "Create an API"
- Select "REST API" for the API type
- Select "Open" for the Security
    - **This is a security vulnerability! If you are not comfortable having this vulnerability, choose "Create JWT authorizer". I will not go over how to set that up.**
- Click "Add"
- You are taken back to the function page, with the "Triggers" section open
- Expand the details for your API Gateway and note the API endpoint. You will use this in the setup of your Zoom app.
    - It will be similar to `https://abcdefgh.execute-api.us-west-2.amazonaws.com/default/yourLambdaFunctionName`

### Zoom App
- In a browser, go to https://marketplace.zoom.us/
- If you don't already have an account, create one
- Sign in
- Click the "Develop" dropdown in the top right
- Select "Build App"
- In the "Webhook Only" section, hit the "Create" button
- Name your app (I named mine "Notifier for Slack")
- Input the needed information on the first step and hit "Continue"
- On the "Feature" step, toggle the "Event Subscriptions" on
- Click "+ Add new event subscription"
  - Name your event subscription
  - Put the URL of your Lambda Function for "Event notification endpoint URL"
    - Click "Add events" and select all Zoom events that you want to be notified about
    - Click "Save"
- Click "Continue"
- Yay, your Zoom app should now be activated!
