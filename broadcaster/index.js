const { connect, StringCodec } = require('nats');

const NATS_URL = process.env.NATS_URL || 'nats://nats:4222';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const SUBJECT = 'todos.events';
const QUEUE_GROUP = 'todo-broadcasters';
const codec = StringCodec();

if (!WEBHOOK_URL) {
  throw new Error('WEBHOOK_URL must be set');
}

function formatMessage(event) {
  if (event.action === 'created') {
    return `A todo was created: ${event.text}`;
  }

  return `A todo was updated: ${event.text} (done: ${event.done})`;
}

async function main() {
  const connection = await connect({ servers: NATS_URL });
  const subscription = connection.subscribe(SUBJECT, { queue: QUEUE_GROUP });
  console.log(`Listening for ${SUBJECT} in queue group ${QUEUE_GROUP}`);

  for await (const message of subscription) {
    try {
      const event = JSON.parse(codec.decode(message.data));
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'bot',
          message: formatMessage(event)
        })
      });

      if (!response.ok) {
        console.error(`Webhook returned HTTP ${response.status}; event was not retried`);
        continue;
      }

      console.log(`Forwarded ${event.action} event for todo ${event.todoId}`);
    } catch (err) {
      console.error('Failed to process todo event; event was not retried:', err.message);
    }
  }
}

main().catch(err => {
  console.error('Broadcaster failed:', err);
  process.exit(1);
});
