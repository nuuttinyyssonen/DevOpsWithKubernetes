# Todo broadcaster

The broadcaster subscribes to todo events from NATS and forwards them to an external HTTP webhook using the Generic payload format:

```json
{
  "user": "bot",
  "message": "A todo was created: Buy milk"
}
```

The Deployment runs six replicas. All replicas subscribe to `todos.events` using the same NATS queue group, `todo-broadcasters`, so NATS sends each event to one replica rather than broadcasting a copy to every replica. This uses Core NATS at-most-once delivery: failed webhook requests are logged and not retried, so messages can be missed but are not deliberately duplicated by retries.

## Deploy

NATS and the webhook Secret must exist in the `project` namespace. Install NATS if it is not already present:

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
helm install nats nats/nats -n project
```

Create a temporary webhook URL at [webhook.site](https://webhook.site), then store it in a Kubernetes Secret. Enter the URL only after the prompt appears; do not commit it to the repository:

```sh
printf 'Paste webhook URL and press Enter: '
read -s WEBHOOK_URL
printf '\n'
kubectl create secret generic broadcaster-webhook -n project \
  --from-literal="WEBHOOK_URL=$WEBHOOK_URL" \
  --dry-run=client -o yaml | kubectl apply -f -
unset WEBHOOK_URL
```

Build and push the image for the GKE node architecture, then deploy the six replicas:

```sh
docker buildx build --platform linux/amd64 \
  -t europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/broadcaster:latest \
  --push ./broadcaster
kubectl apply -k broadcaster/manifests
kubectl rollout status deployment/broadcaster -n project
kubectl get pods -l app=broadcaster -n project
```

## Test

Create a todo or mark one as done in the Todo app. Check webhook.site for one message and inspect broadcaster logs:

```sh
kubectl logs -l app=broadcaster -n project --prefix --since=5m
```

A successful delivery is logged by the one replica that handled the event. The other queue-group replicas should not forward duplicates.
