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