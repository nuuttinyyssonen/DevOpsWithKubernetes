# Todo app

A simple Express web server that responds to GET `/` with an HTML page showing a random image from Lorem Picsum, a form for creating new todos, and the current list of todos rendered server-side. NOTE HTML page's CSS styles have been made with Claude to match to the ones in course example.

The image URL is cached to a file on a shared PersistentVolume and only refreshed every 10 minutes, so the same image is shown across requests within that window, and the app doesn't need to hit an external API on every page load.

Submitting the form sends a POST request to this app, which forwards the new todo to the "Todo backend" service over HTTP. The list of todos shown on the page is fetched from "Todo backend" on every page load, so newly created todos appear immediately after submitting.

Todo uses namespace project  

All ports, URLs, and other configuration values are passed in via a ConfigMap instead of being hardcoded in the source code.  

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

## Deploy to GKE

Build and push the `linux/amd64` image to Artifact Registry, then deploy with Kustomize:

```sh
docker build --platform linux/amd64 -t europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/todo:latest .
docker push europe-north1-docker.pkg.dev/devopswithkubernetes-509407/dwk-repo/todo:latest
kubectl create namespace project 2>/dev/null || true
kubectl apply -k manifests
```

The app is available at the external IP of `todo-ingress`:

```sh
kubectl get ingress todo-ingress -n project
```

## Exercise 3.9 DBaaS vs DIY
Database as a service offers easy maintenance, updates, scalability and backups are usually automated with point-in-time recovery and one-click restore, which is its biggest advantage. On the downside DBaaS costs might usually be much higher and also potential risk of vendor lock-in.

DIY, company has full control of the whole database and its configurations. Costs could be much more smaller compared to DBaaS. Backups must be built manually and restore procedures are easy to neglect. It requires manually provisioning storage, configuring the database, and writing your own deployment manifests meaning more upfront work.