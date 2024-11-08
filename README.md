# Cloning a Git Repository

To clone a repository from GitHub (or any other remote source), follow these steps:

## Clone The Repository

```bash
git clone https://github.com/Hasib105/Generated-Chat.git
```

## Add a .env to the backend and Provide groq API KEY

```bash
SECRET_KEY=django-insecure-1obc6k@3v_ssuou*ge8r@+$%-)#dp)7h3-2#j7q(ishw(j_zpd
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,backend

MONGO_DB_NAME=aidata
MONGO_DB_USER=hasib
MONGO_DB_PASSWORD=hasib_100
MONGO_DB_HOST=localhost
MONGO_DB_PORT=27017

GORQ_API_KEY=
```

## create a venv using pipenv & install dependencies

```bash
pipenv shell
pipenv install
```

## Connect with mongodb

```bash
cd db
docker-compose up -d
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
