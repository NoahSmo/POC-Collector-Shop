# Collector.shop Complete POC

This is the orchestration documentation to test the entire stack.

## 1. Running Locally (Docker Compose)

The easiest way to start both the Frontend, Backend, and a Database simultaneously is via Docker Compose. Note: For this POC, a MongoDB image is included, but our mock Express APIs use in-memory arrays. In a real environment, you'd swap the mock arrays for Mongoose schemas.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. From the root directory, build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Access the UI: http://localhost:5173
4. Access the API: http://localhost:3000/api/listings

## 2. API & Load Testing

We have included automated testing tools to validate the performance and correctness of the backend.

### Running the API Test
A simple Node.js script is provided to test the authentication flow and fetch pending products.
1. Make sure your local Docker Compose stack is running.
2. From the root directory, execute:
   ```bash
   node test_api.js
   ```

### Load Testing with k6
We use [k6](https://k6.io/) to measure the performance of our API under load.
1. Install [k6](https://k6.io/docs/getting-started/installation/).
2. Start your backend and execute the load test script from the `services/backend/load-test` directory:
   ```bash
   k6 run k6-script.js
   ```
   This script ramps up to 20 virtual users and verifies that 95% of requests complete in under 200ms.

## 3. Metrics & Monitoring
The stack includes a Prometheus configuration to scrape metrics from the Node.js backend.
- **Prometheus config**: `prometheus.yml` scrapes the `backend:3000` target.
*(Note: To fully utilize this, ensure Prometheus is running and pointed at the configuration.)*

## 4. Running the Minikube / Kubernetes Simulation

This section answers "Where is the Minikube config?". For production simulation, we deploy our Docker images into a local Kubernetes cluster.

### Prerequisites
- Install `minikube` & `kubectl`
- Have Docker running

### Deployment Steps
1. Start minikube:
   ```bash
   minikube start --driver=docker
   ```
2. Point your terminal to use Minikube's internal Docker daemon (so K8s can see our local images):
   ```bash
   # On Mac/Linux:
   eval $(minikube docker-env)
   ```
3. Build the backend image inside Minikube's registry:
   ```bash
   docker build -t collector-shop-backend:local ./services/backend
   ```
4. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/backend-service.yaml
   ```
5. Check if the Pod is running:
   ```bash
   kubectl get pods
   ```
6. Expose the API to your local machine:
   ```bash
   minikube service collector-backend-service
   ```

## 5. How to Make a "Better" POC (Next Steps)

To transition this from a POC to an MVP, consider adding:

1. **Real IDP Integration**: Replace the mock JWT system in `auth.middleware.ts` by connecting to a real Keycloak instance. Introduce an OAuth2 flow on the frontend instead of `mockLoginAdmin()`.
2. **WebSockets (Socket.io)**: The chat in `UserDashboard` is currently static CSS. To make it a true POC of real-time negotiation, attach a Socket.io server to Express and emit text streams.
3. **Connect the Storage**: Our POST payload accepts an array of strings as `images`. Add a physical upload route utilizing `Multer` to push files to an AWS S3 bucket, then returning their pre-signed URLs.
4. **Actual Python Microservice**: We mocked the "validation AI". The next infrastructural step is adding `collector-shop-checker` (a FastAPI wrapper around PyTorch/OpenCV) connected via `ampqlib` (RabbitMQ) to read the listing payload.
