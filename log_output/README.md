# Log output

The application is split into two containers running in a single Pod, sharing a volume:

- writer: generates a random string on startup and writes it, along with a timestamp,
  to a shared file every 5 seconds.
- reader: a simple Express server that reads that file, along with the "Ping pong" app's
  request counter, and returns both on GET `/`.

The writer and reader containers share an `emptyDir` volume mounted at `/usr/src/app/files`
for the status file. This is separate from, and not shared with, the "Ping pong" app anymore —
the two apps now communicate over HTTP instead of a shared PersistentVolume.


The original single-container `index.js` at the root of this folder is kept for reference
from earlier exercises, but is no longer used in the current deployment — the app now runs
from the `writer/` and `reader/` subfolders instead, each with its own `Dockerfile` and
`package.json`.

Log_output uses namespace exercises  
NOTE also fixed ingress and service files from previous exericse (2.4) to include the namespace exercises

The reader also reads a ConfigMap, mounted as a volume, and prints the content of a file
(`information.txt`) from it alongside a `MESSAGE` environment variable also sourced from
that same ConfigMap, in addition to the usual output.

## Run locally

Writer:  
cd log_output/writer  
npm install  
node index.js  

Reader (in a separate terminal):  
cd log_output/reader  
npm install  
node index.js  

## Run in Kubernetes (k3d)

cd log_output/writer  
docker build -t log-output-writer:latest .  
k3d image import log-output-writer:latest -c k3s-default  

cd ../reader  
docker build -t log-output-reader:latest .  
k3d image import log-output-reader:latest -c k3s-default  

cd ..  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl get pods  

## Connecting to Ping pong

The reader container calls the "Ping pong" app's own HTTP endpoint directly, using
Kubernetes' internal Service DNS name, to get the current request count:

http://ping-pong:80/pings

No shared volume or file is used between the two apps anymore. The combined response is
produced like:

2026-09-15T09:24:32.553Z: gbwxbokwdaaovzom, Ping / Pongs: 3

## Accessing the app

This app shares a Gateway API HTTPRoute with the "Ping pong" application.
The shared Gateway and route definitions are kept in the repository `manifests/` directory.

It routes:

- `/` → this app (reader container)
- `/pingpong` → the "Ping pong" app

it can be reached at:

curl http://localhost:8081/  

## Testing / checking logs

Since the Pod now has two containers, specify which one when checking logs:

kubectl get pods  
kubectl logs -f deployment/log-output -c writer  
kubectl logs -f deployment/log-output -c reader

## Deploying to Google Kubernetes Engine (GKE)

For GKE, build both container images for the `linux/amd64` platform and push them
to Artifact Registry:

```sh
docker build --platform linux/amd64 \
  -t europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/log-output-writer:latest \
  ./writer
docker push europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/log-output-writer:latest

docker build --platform linux/amd64 \
  -t europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/log-output-reader:latest \
  ./reader
docker push europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/log-output-reader:latest
```

Apply the ConfigMap, deployment, Service, Gateway, and HTTPRoute in the `exercises` namespace:

```sh
kubectl apply -f manifests/configmap.yaml \
  -f manifests/deployment.yaml \
  -f manifests/service.yaml
kubectl apply -f ../manifests/gateway.yaml -f ../manifests/httproute.yaml
kubectl get pods -n exercises
kubectl get gateway,httproute -n exercises
```

Once the Gateway has an external IP, the reader is available at its root path:

```sh
curl http://<GATEWAY-IP>/
```

## Readiness probes

Ping-pong has a readiness probe on `/healthz` that only succeeds when the app can connect to the Postgres database, so the pod stays `0/1` until the database is available.

The Log output reader has a readiness probe on its own `/healthz`, which calls the Ping-pong `/pings` endpoint. It only becomes ready when it can receive data from Ping-pong, so the pod stays `1/2` while Ping-pong is unavailable. The writer container has no probe.

To test, delete the database StatefulSet and check the pod states:

kubectl delete statefulset postgres -n exercises  
kubectl get po -n exercises  

Ping-pong drops to `0/1` and Log output to `1/2`. Applying the StatefulSet again brings them back to `1/1` and `2/2` automatically:

kubectl apply -f manifests/postgres-statefulset.yaml

## GitOps with Argo CD

The Argo CD Application at `argocd/log-output-application.yaml` watches the `main` branch and the `log_output/manifests` path, then syncs those resources to the `exercises` namespace. Changes committed and pushed to that path are applied automatically.

Check sync status and watch the workload:

```sh
kubectl get application log-output -n argocd
kubectl get pods -n exercises -l app=log-output -w
```

Argo CD applies Kubernetes manifests; it does not build container images. For application code changes, build and push a new image and commit the updated image reference in the Deployment manifest.