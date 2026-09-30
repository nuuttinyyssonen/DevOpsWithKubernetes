# Project environments

# NOTE FOR THE INSTRUCTOR
Most of the solution and debugging was done with co-pilot for exercise 4.9. I think it was easily the most complex exercise so far, so the returned assignment might be a bit all over the place and nowhere near perfect.   

The Todo project has two isolated Argo CD environments:

- `staging` watches `main` and runs the broadcaster with `LOG_ONLY=true`. It has its own Postgres PVC and NATS broker and does not include the database backup CronJob.
- `production` watches the `production` branch. The tag workflow promotes tagged source commits to that branch, updates image tags, and includes the database backup CronJob.

## One-time cluster setup

The environment Kustomizations reuse service manifests outside their overlay directories. Configure Argo CD's repo-server to allow those references. This is a global option, so only use it for trusted repositories:

```sh
kubectl patch configmap argocd-cm -n argocd --type merge \
  -p '{"data":{"kustomize.buildOptions":"--load-restrictor LoadRestrictionsNone"}}'
kubectl rollout restart deployment/argocd-repo-server -n argocd
```

Before syncing the environment Applications, apply external secrets in their namespaces. Both environments require a `todo-postgres` Secret with a `POSTGRES_PASSWORD` key. Production also requires `broadcaster-webhook` with a `WEBHOOK_URL` key; staging does not need this Secret because its broadcaster only logs events. Create the namespaces before applying Secrets:

```sh
kubectl create namespace staging
kubectl create namespace production
```

The existing `todo` and `todo-backend` Applications still manage the legacy `project` namespace. Before their next rollout, either provision `todo-postgres` in `project` too or remove those legacy Applications after the new environments are healthy.

The first pushed Git tag creates the `production` branch from that tagged commit. Wait for the tag workflow to finish before creating the production Argo CD Application; this ensures production starts from a tagged release, not an untagged `main` commit.

Apply the staging Application after committing these files to `main`:

```sh
kubectl apply -f argocd/project-staging-application.yaml
```

After the first tag workflow has created the `production` branch and the production webhook Secret and Workload Identity binding are ready, apply the production Application:

```sh
kubectl apply -f argocd/project-production-application.yaml
```

The production backup ServiceAccount uses Workload Identity. Grant `todo-backup-ksa` in namespace `production` the required Workload Identity binding and GCS bucket permissions outside Argo CD.

## Release flow

Commits to `main` are reconciled by Argo CD in staging. Changes to Todo, Todo-backend, or broadcaster source also trigger GitHub Actions to build SHA-tagged images and commit updated staging image tags to `main`.

Pushing a Git tag builds the images from that tagged commit and promotes its manifests and image tags to the `production` branch. Argo CD then reconciles production. The workflow requires the existing `GKE_PROJECT`, `WORKLOAD_IDENTITY_PROVIDER`, and `SERVICE_ACCOUNT` GitHub secrets and write permission for `GITHUB_TOKEN` to push image-update commits.
