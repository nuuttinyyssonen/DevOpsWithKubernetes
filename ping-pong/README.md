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

This app shares a Gateway API HTTPRoute with the "Log output" application. The shared definitions are in `manifests/gateway.yaml` and `manifests/httproute.yaml`. They route:

- `/pingpong` → this app
- `/` → the "Log output" app

curl http://localhost:8081/pingpong

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/ping-pong

## Deploying to Google Kubernetes Engine (GKE)

This app can be deployed to a GKE cluster together with Postgres and the Log output application.

### Building and pushing the image to Artifact Registry

The image is stored in Google's Artifact Registry so that GKE can pull it.

```sh
gcloud artifacts repositories create dwk-repo \
  --repository-format=docker \
  --location=europe-north1

gcloud auth configure-docker europe-north1-docker.pkg.dev

docker build --platform linux/amd64 \
  -t europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/ping-pong:latest .
docker push europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/ping-pong:latest
```

### Deploying the application

Apply the Postgres resources, the ping-pong deployment and Service, then apply the shared Gateway and HTTPRoute:

```sh
kubectl apply -f manifests/postgres-pv.yaml \
  -f manifests/postgres-pvc.yaml \
  -f manifests/postgres-service.yaml \
  -f manifests/postgres-statefulset.yaml
kubectl apply -f manifests/gke-deployment.yaml
kubectl apply -f manifests/service.yaml
kubectl apply -f ../manifests/gateway.yaml -f ../manifests/httproute.yaml
```

The HTTPRoute sends `/pingpong` to the ping-pong Service and `/` to the log-output Service. The ping-pong application also responds with `ok` at `/`, which keeps the Service independently healthy.

Check the deployment and Gateway address:

```sh
kubectl get pods -n exercises
kubectl get gateway,httproute -n exercises
```

Once the Gateway has an external IP, test the public endpoint:

```sh
curl http://<GATEWAY-IP>/pingpong
```