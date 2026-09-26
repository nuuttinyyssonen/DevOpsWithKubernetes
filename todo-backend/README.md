# Todo backend

A simple Express web server that manages todo items in memory. Provides a GET `/todos` endpoint to fetch the current list of todos, and a POST `/todos` endpoint to create a new one. Todos are stored purely in memory, so they reset if the pod restarts. A database will replace this in a later exercise.

Todo-backend uses namespace project  

All ports, URLs, and other configuration values are passed in via a ConfigMap instead of being hardcoded in the source code.  

## Run locally

npm install  
PORT=3000 node index.js  

## Postgres

Todos are stored in a Postgres database instead of in memory, so they survive pod restarts.

Postgres runs as a StatefulSet (1 replica) in the `project` namespace, backed by its own PersistentVolume and PersistentVolumeClaim, separate from the Postgres instance used by the "Ping pong" application.

Before applying, the local path must exist on the node:

docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/postgres-todo  

kubectl apply -f manifests/postgres-pv.yaml  
kubectl apply -f manifests/postgres-pvc.yaml  
kubectl apply -f manifests/postgres-service.yaml  
kubectl apply -f manifests/postgres-statefulset.yaml  

This app connects to it using the `pg` npm package, with connection details (`POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) passed in via a ConfigMap (`todo-backend-config`) rather than hardcoded in the source code. On startup, it creates a `todos` table if it doesn't already exist, and reads/writes rows there instead of an in-memory array.

To connect manually for debugging:

kubectl run -it --rm --restart=Never --image postgres psql-for-debugging -n project --env="PGPASSWORD=mysecretpassword" -- psql -h postgres-todo -U postgres

## Run in Kubernetes (k3d)

docker build -t todo-backend:latest .  
k3d image import todo-backend:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl get pods  

## Connecting to the Todo app

The "Todo app" frontend calls this service over HTTP, using Kubernetes' internal Service DNS name, to fetch and create todos:

http://todo-backend:2345/todos  

This service is not exposed via Ingress directl.

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/todo-backend  

Fetch todos directly from inside the pod:

kubectl exec -it <todo-backend-pod-name> -- wget -qO- http://localhost:3000/todos  

## Wikipedia reminder CronJob

A CronJob runs every hour and creates a new todo reminding you to read a random Wikipedia article. It fetches a random article URL from Wikipedia's `Special:Random` page, then POSTs a new todo with the text `Read <URL>` to this service's `/todos` endpoint.

manifests/wikipedia-cronjob.yaml  

kubectl apply -f manifests/wikipedia-cronjob.yaml  

To trigger a run manually for testing, without waiting for the schedule:

kubectl create job --from=cronjob/wikipedia-todo test-run -n project  

Check its status and logs:

kubectl get jobs -n project  
kubectl get pods -n project  
kubectl logs <job-pod-name> -n project

## Deploy to GKE

Build and push the `linux/amd64` image to Artifact Registry, then deploy with Kustomize:

```sh
docker build --platform linux/amd64 -t europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/todo-backend:latest .
docker push europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/todo-backend:latest
kubectl create namespace project 2>/dev/null || true
kubectl apply -k manifests
```

## Database backup CronJob

A CronJob runs once every 24 hours, creates a `pg_dump` backup of the todo database, and uploads it to a Google Cloud Storage bucket. It authenticates to Google Cloud using Workload Identity, via a dedicated Kubernetes ServiceAccount (`todo-backup-ksa`) bound to a Google IAM service account with storage write permissions, no key file is stored in the cluster or the repository.

manifests/backup-cronjob.yaml  

kubectl apply -f manifests/backup-cronjob.yaml  

To trigger a run manually for testing:

kubectl create job --from=cronjob/todo-db-backup test-backup -n project  

Check its status and logs:

kubectl get jobs -n project  
kubectl get pods -n project  
kubectl logs <job-pod-name> -n project 

## Resource requests and limits

CPU and memory requests/limits are set based on observed usage via `kubectl top pods`.