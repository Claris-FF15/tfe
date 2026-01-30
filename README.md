# RFID / NFC Access Control System

A complete RFID/NFC access control system using ESP32, FastAPI, PostgreSQL, Docker, and try to do a full CI/CD DevOps pipeline

This project is designed to be scalable, secure, and production-ready, supporting multiple doors, time-based access rules, and automatic deployment.

## Features

* ESP32 + RFID/NFC (MFRC522 / PN532) for the Hardware
* Wi-Fi communication (REST API)
* Python + FASTAPI for the Backend
* PostgreSQL for the Database
* Docker & Docker Compose
* API Key authentication (ESP32 → API)
* Multi-door access control
* Time-based & day-based access rules
* Access logging
* Automated tests
* Linting & formatting (Ruff + Black)
* Security scanning (Trivy)
* Full CI/CD with GitHub Actions (Try)
* Automatic deployment to VPS

## Architecture Overview
```
bash 

ESP32 (RFID Reader)
   |
   |  HTTP POST (JSON + API KEY)
   v
FastAPI Backend (Docker)
   |
   v
PostgreSQL Database
```

## Project Structure
```
bash

badge-access/
│
├── .github/workflows/
│   └── ci-cd.yml         
│
├── docker/
│   └── Dockerfile
│
├── docker-compose.yml
├── requirements.txt
├── README.md
│
└── app/
    ├── main.py           
    ├── database.py        
    ├── models.py          
    ├── schemas.py         
    ├── security.py        
    ├── crud.py            
    ├── routers/
    │   └── access.py      
    └── tests/
        └── test_access.py
```

