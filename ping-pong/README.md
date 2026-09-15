# Ping pong app

A simple Express web server that responds to GET `/pingpong` with `pong N`, where N is a counter that increases by 1 on every request. The counter is written to a file on a shared PersistentVolume, so it survives pod restarts and is also readable by the "Log output" application.

## Run locally

npm install  
PORT=3000 node index.js  

## Run in Kubernetes (k3d)

docker build -t ping-pong:latest .  
k3d image import ping-pong:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl get pods  

## Shared storage

This app shares a PersistentVolume with the "Log output" application. The PersistentVolume and PersistentVolumeClaim definitions are kept separately from either app, in the top-level `manifests` folder.

kubectl apply -f ../manifests/persistentvolume.yaml  
kubectl apply -f ../manifests/persistentvolumeclaim.yaml  

The counter is written to `/usr/src/app/files/pingpong-counter.txt` on the shared volume. The "Log output" app reads this same file to display the current count alongside its own status.

## Accessing the app

This app shares an Ingress with the "Log output" application. The combined Ingress definition is in `log_output/manifests/ingress.yaml` (see that app's README for details). It routes:

- `/pingpong` → this app
- `/` → the "Log output" app

curl http://localhost:8081/pingpong

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/ping-pong