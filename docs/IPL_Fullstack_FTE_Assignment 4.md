# **Assignment: IPL Data Platform (Full-Stack – Intern Profile)** 

## **Overview** 

You are given an IPL (Indian Premier League) dataset and asked to design and build a production-ready full-stack application. This assignment evaluates your ability to work across data modeling, backend and frontend development, containerization, CI/CD, and cloud-native deployment practices. 

The application should: 

1. Store the data in PostgreSQL 

2. Expose data via Backend APIs (Node.js or Python) 

3. Document APIs using OpenAPI (Swagger) 

4. Display insights on a Frontend web application 

5. Be containerized and deployed using modern DevOps practices  (Far fetched goal) 

## **Dataset** 

The IPL dataset can be downloaded from the link below: 

<u>Indian_Premier_League_2022-03-26.zip</u> 

You are expected to understand the dataset, design an appropriate schema, and manage data ingestion in a scalable manner. 

## **Tech Stack (Flexible)** 

Database: PostgreSQL Backend: Node.js or Python 

Data Access: ORM or query builder of your choice (Prisma, Drizzle, SQLAlchemy, etc.) Frontend: React / Next.js or equivalent 

Containers: Docker 

CI/CD: GitHub Actions 

Cloud: Any major cloud provider (Azure or GCP preferred) 

## **Core Requirements** 

### **1. Database & Data Modeling** 

Design a relational schema suitable for the IPL dataset. Use migrations and seed/load the provided data into PostgreSQL. 

### **2. Backend API** 

Build backend APIs that expose IPL data to the frontend. APIs must return JSON, support pagination and filtering where applicable, include proper validation and error handling, and expose a health check endpoint. All APIs must be documented using OpenAPI, with Swagger UI enabled. 

### **3. Frontend Application** 

Create a web UI that consumes backend APIs and presents IPL insights. The application must include multiple screens/pages, charts and tabular views, and must properly handle loading, empty, and error states. 

### **4. Containerization** 

Create Dockerfiles for backend and frontend services. Provide a docker-compose setup for local development. 

### **5. CI/CD** 

Set up GitHub Actions workflows to run linting and tests, build Docker images, and deploy applications on successful merges. 

## **Optional Stretch Goals** 

- Terraform code for infrastructure provisioning (Infrastructure as Code) 

- Datadog integration for monitoring, logging, and basic dashboards 

- Kubernetes deployment, with proper configmaps and helm charts 

## **Submission Checklist** 

GitHub repository containing: 

- Clear README with architecture overview 

- Local and deployed setup instructions 

- Database schema/migrations 

- Dockerfiles and docker-compose 

- GitHub Actions workflows 

- Kubernetes configuration files 

- Access to OpenAPI documentation 

- Deployed application URLs 

## **Notes** 

This assignment is intended for experienced engineers. Code quality, system design, clarity of thought, and production readiness will be valued more than feature count. 

