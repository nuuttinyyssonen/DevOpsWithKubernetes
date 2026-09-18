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
kubectl apply -f manifests/ingress.yaml  
kubectl get pods  

## Connecting to Ping pong

The reader container calls the "Ping pong" app's own HTTP endpoint directly, using
Kubernetes' internal Service DNS name, to get the current request count:

http://ping-pong:4567/pings  

No shared volume or file is used between the two apps anymore. The combined response is
produced like:

2026-09-15T09:24:32.553Z: gbwxbokwdaaovzom, Ping / Pongs: 3

## Accessing the app

This app shares a single Ingress with the "Ping pong" application.
The combined Ingress definition is kept here at `log_output/manifests/ingress.yaml`

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