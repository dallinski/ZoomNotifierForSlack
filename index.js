const axios = require('axios')

const slackEndpointForIncomingWebhooks = '{your_slack_webhook_endpoint_goes_here}';

exports.handler = async (event) => {
    try {
        const eventBody = JSON.parse(event.body);

        let eventName = parseEventName(eventBody.event);
        let topic = eventBody.payload.object.topic;
        let payloadString = JSON.stringify(eventBody.payload.object, null, '\t');

        const now = new Date();
        const formattedNow = now.toLocaleString('en-US', { timeZone: 'America/Denver' });

        const slackBlockMessage = {
            'blocks': [
                {
                    'type': 'divider'
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': '*' + eventName + '* at ' + formattedNow
                    }
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': topic
                    }
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': '```' + payloadString + '```'
                    }
                }
            ]
        };

        const res = await axios.post(
            slackEndpointForIncomingWebhooks,
            JSON.stringify(slackBlockMessage),
            {
                headers: {
                    'content-type': 'application/json'
                }
            }
        );

        console.log(res);

        return {
            statusCode: 200,
            body: JSON.stringify(res)
        }
    } catch (e) {
        console.log(e);
        return {
            statusCode: 400,
            body: JSON.stringify(e)
        }
    }
};

function parseEventName(eventName) {
    const eventNameWithoutUnderscores = eventName.replace('_', ' ');
    const eventNameWithoutPeriods = eventNameWithoutUnderscores.replace('.', ' ');
    return capitalizeFirstLetterOfEveryWord(eventNameWithoutPeriods.replace('.', ' '))
}

function capitalizeFirstLetterOfEveryWord(string) {
    return string.replace(/(^\w|\s\w)/g, m => m.toUpperCase())
}
