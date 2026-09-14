# Log output

Generates a random string on startup, keeps it in memory, and logs it with a timestamp every 5 seconds.
Also exposes an HTTP endpoint that returns the current timestamp and the random string, accessible via Ingress.

## Run locally

cd log_output  
npm install  
node index.js  

## Run in Kubernetes (k3d)

docker build -t log-output:latest .  
k3d image import log-output:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl apply -f manifests/ingress.yaml  
kubectl get pods  

## Accessing the app


This app shares a single Ingress with the "Ping pong" application.
The combined Ingress definition is kept here at `log_output/manifests/ingress.yaml`,
even though it also routes traffic to the `ping-pong` app, since it originated
as this app's Ingress before being extended to cover both.

It routes:

- `/` → this app
- `/pingpong` → the "Ping pong" app

it can be reached at:

​```
curl http://localhost:8081/
​```

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/log-output