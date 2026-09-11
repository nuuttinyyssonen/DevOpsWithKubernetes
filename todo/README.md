# Todo app

A simple Express web server that logs `Server started in port NNNN` on startup.

## Run locally

​```bash
npm install
PORT=5001 node index.js
​```

## Run in Kubernetes (k3d) without Yaml file

​```bash
docker build -t todo:latest .
k3d image import todo:latest -c k3s-default
kubectl create deployment todo --image=todo:latest
kubectl set env deployment/todo PORT=5001
kubectl patch deployment todo -p '{"spec":{"template":{"spec":{"containers":[{"name":"todo","imagePullPolicy":"Never"}]}}}}'
kubectl get pods
​```