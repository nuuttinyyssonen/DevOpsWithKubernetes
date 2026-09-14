# Todo app

A simple Express web server that responds to GET `/` with an HTML page, and logs `Server started in port NNNN` on startup.

## Run locally

​```
npm install
PORT=5001 node index.js
​```

## Run in Kubernetes (k3d)

docker build -t nuuttinyyssonen/todo:latest .  
docker push nuuttinyyssonen/todo:latest  
kubectl apply -f manifests/deployment.yaml  
kubectl apply -f manifests/service.yaml  
kubectl apply -f manifests/ingress.yaml  
kubectl get pods  

Image is pulled directly from Docker Hub: https://hub.docker.com/r/nuuttinyyssonen/todo

## Updating after code changes

docker build -t nuuttinyyssonen/todo:latest .  
docker push nuuttinyyssonen/todo:latest  
kubectl rollout restart deployment/todo  


## Accessing the app

The app is exposed via an Ingress, routed through the cluster's load balancer instead of a NodePort. Cluster created with:

​```
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
​```

it can be reached at:

​```
curl http://localhost:8082/
​```

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/todo