# Ping pong app

A simple Express web server that responds to GET `/pingpong` with `pong N`, where N is a counter that increases by 1 on every request. 

The app also exposes a `/pings` endpoint that returns the current count as plain text, used by the "Log output" application to display the count over HTTP instead of a shared file.

ping-pong uses namespace exercises  
NOTE also fixed service file from previous exericse (2.4) to include the namespace exercises  

## Run locally

npm install  
PORT=3000 node index.js  

## Run in Kubernetes (k3d)

docker build -t ping-pong:latest .  
k3d image import ping-pong:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl get pods  

## Postgres

The counter is stored in a Postgres database instead of in memory, so it survives pod restarts.

Postgres runs as a StatefulSet (1 replica) in the `exercises` namespace, backed by its own PersistentVolume and PersistentVolumeClaim, separate from the shared storage used in earlier exercises.

Before applying, the local path must exist on the node:

docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/postgres  

kubectl apply -f manifests/postgres-pv.yaml  
kubectl apply -f manifests/postgres-pvc.yaml  
kubectl apply -f manifests/postgres-service.yaml  
kubectl apply -f manifests/postgres-statefulset.yaml  

This app connects to it using the `pg` npm package, with connection details passed in as environment variables (`POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) rather than hardcoded in the source code. On startup, it creates a `counter` table if it doesn't already exist, and increments/reads the count from there instead of an in-memory variable.

To connect manually for debugging:  

kubectl run -it --rm --restart=Never --image postgres psql-for-debugging -n exercises --env="PGPASSWORD=mysecretpassword" -- psql -h postgres -U postgres

## Connecting to Log output

The "Log output" app calls this app's `/pings` endpoint directly over HTTP, using
Kubernetes' internal Service DNS name (`ping-pong`), instead of reading from a shared
PersistentVolume as in earlier exercises.

## Accessing the app

This app shares an Ingress with the "Log output" application. The combined Ingress definition is in `log_output/manifests/ingress.yaml` (see that app's README for details). It routes:

- `/pingpong` → this app
- `/` → the "Log output" app

curl http://localhost:8081/pingpong

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/ping-pong