# Todo app

A simple Express web server that logs `Server started in port NNNN` on startup.

## Run locally

​```bash
npm install
PORT=5001 node index.js
​```

## Run in Kubernetes (k3d)

docker build -t todo:latest .  
k3d image import todo:latest -c k3s-default  
kubectl apply -f manifests/deployment.yaml  
kubectl get pods  