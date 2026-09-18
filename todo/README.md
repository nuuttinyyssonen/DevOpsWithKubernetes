# Todo app

A simple Express web server that responds to GET `/` with an HTML page showing a random image from Lorem Picsum, a form for creating new todos, and the current list of todos rendered server-side. NOTE HTML page's CSS styles have been made with Claude to match to the ones in course example.

The image URL is cached to a file on a shared PersistentVolume and only refreshed every 10 minutes, so the same image is shown across requests within that window, and the app doesn't need to hit an external API on every page load.

Submitting the form sends a POST request to this app, which forwards the new todo to the "Todo backend" service over HTTP. The list of todos shown on the page is fetched from "Todo backend" on every page load, so newly created todos appear immediately after submitting.

## Run locally

npm install  
PORT=5001 node index.js  

## Run in Kubernetes (k3d)

docker build -t nuuttinyyssonen/todo:latest .  
docker push nuuttinyyssonen/todo:latest  
kubectl apply -f manifests/deployment.yaml  
kubectl get pods  

Image is pulled directly from Docker Hub: https://hub.docker.com/r/nuuttinyyssonen/todo

## Shared storage

This app uses the same PersistentVolume shared with the "Ping pong" and "Log output" applications. The PersistentVolume and PersistentVolumeClaim definitions are kept separately, in the top-level `manifests`

kubectl apply -f ../manifests/persistentvolume.yaml  
kubectl apply -f ../manifests/persistentvolumeclaim.yaml  

The image URL is written to `/usr/src/app/files/image-url.txt` on the shared volume.

## Connecting to Todo backend

This app calls the "Todo backend" service over HTTP, using Kubernetes' internal Service DNS name, to fetch and create todos:

http://todo-backend:2345/todos  

## Updating after code changes

docker build -t nuuttinyyssonen/todo:latest .  
docker push nuuttinyyssonen/todo:latest  
kubectl rollout restart deployment/todo  

## Testing / checking logs

kubectl get pods  
kubectl logs -f deployment/todo  

kubectl port-forward deployment/todo 5001:5001  

Then in another terminal:

curl http://localhost:5001/