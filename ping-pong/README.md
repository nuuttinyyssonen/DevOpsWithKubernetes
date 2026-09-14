# Ping pong app

A simple Express web server that responds to GET `/pingpong` with `pong N`,
where N is an in-memory counter that increases by 1 on every request.
The counter resets if the pod restarts.

## Run locally

npm install  
PORT=3000 node index.js  

## Run in Kubernetes (k3d)

docker build -t ping-pong:latest .  
k3d image import ping-pong:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl get pods  

## Accessing the app

This app shares an Ingress with the "Log output" application.
The combined Ingress definition is in `log_output/manifests/ingress.yaml`
(see that app's README for details). It routes:

- `/pingpong` → this app
- `/` → the "Log output" app

​```
curl http://localhost:8081/pingpong
​```

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/ping-pong  