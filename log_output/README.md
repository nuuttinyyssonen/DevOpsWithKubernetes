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

The app is exposed via an Ingress, routed through the cluster's load balancer (we did this last exercise).

​```
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
​```

it can be reached at:

​```
curl http://localhost:8081/
​```

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/log-output