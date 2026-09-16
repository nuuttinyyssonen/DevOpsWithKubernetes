# Ping pong app

A simple Express web server that responds to GET `/pingpong` with `pong N`, where N is a counter that increases by 1 on every request. 

The app also exposes a `/pings` endpoint that returns the current count as plain text, used by the "Log output" application to display the count over HTTP instead of a shared file.


## Run locally

npm install  
PORT=3000 node index.js  

## Run in Kubernetes (k3d)

docker build -t ping-pong:latest .  
k3d image import ping-pong:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl get pods  

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