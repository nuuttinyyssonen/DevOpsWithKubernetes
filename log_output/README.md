# Log output

Generates a random string on startup, keeps it in memory, and logs it with a timestamp every 5 seconds.

## Run locally

​```bash
cd log_output
node index.js
​```

## Run in Kubernetes (k3d)

docker build -t log-output:latest .  
k3d image import log-output:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl logs -f deployment/log-output  