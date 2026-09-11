# Todo app

A simple Express web server that logs `Server started in port NNNN` on startup.

## Run locally

​```bash
npm install
PORT=5001 node index.js
​```

# for updates
docker build -t nuuttinyyssonen/todo:latest .  
docker push nuuttinyyssonen/todo:latest  
kubectl rollout restart deployment/todo  

## Run in Kubernetes (k3d)

docker build -t nuuttinyyssonen/todo:latest .  
docker push nuuttinyyssonen/todo:latest  
kubectl apply -f manifests/deployment.yaml  
kubectl get pods  

Image is pulled directly from Docker Hub: https://hub.docker.com/r/nuuttinyyssonen/todo

## Testing the deployment
kubectl get po
todo-c548989bf-qmdkq
kubectl port-forward todo-c548989bf-qmdkq 5001:5001