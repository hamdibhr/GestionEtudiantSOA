# ⚙️ Spécifications Techniques - Projet SOA Université

Ce document détaille l'architecture technique, les choix technologiques, les schémas de données et les contrats d'interface (API) du système.

---

## 1. Architecture Globale

Le projet repose sur une architecture **Microservices Conteneurisée**. Chaque service est isolé, possède sa propre responsabilité métier et communique avec les autres via des protocoles standards (HTTP/REST et SOAP).

### Diagramme de Flux
`Client (React)` ➔ `API Gateway (Port 8080)` ➔ `Service Spécifique` ➔ `Base de Données (MongoDB)`

---

## 2. Stack Technologique (Polyglotte)

Le projet démontre l'interopérabilité entre 4 langages différents :

| Composant | Technologie | Langage | Port Interne | Port Docker |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | Spring Cloud Gateway | Java 17 | `8080` | `8080` |
| **Auth Service** | Spring Boot 3 + Security | Java 17 | `8088` | `8088` |
| **Student Service** | Express.js | Node.js v18 | `3000` | `3000` |
| **Grade Service** | FastAPI | Python 3.9 | `5000` | `5000` |
| **Course Service** | JAX-WS (Metro) | Java 17 | `8082` | `8082` |
| **Billing Service** | ASP.NET Core | C# (.NET 7) | `80` | `8083` |
| **Frontend** | React + Vite | JavaScript | `80` | `8090` |
| **Database** | MongoDB | NoSQL | `27017` | `27017` |

---

## 3. Modèle de Données (MongoDB)

Bien que NoSQL, nous maintenons une structure cohérente.

### 3.1. Collection `users` (Auth Service)
Utilisée pour l'authentification et les rôles.
```json
{
  "_id": "ObjectId(...)",
  "username": "admin",
  "password": "123",  // Stocké en clair pour démo (Hashé en prod)
  "role": "ADMIN"     // Enum: ADMIN, TEACHER, STUDENT
}

3.2. Collection students (Student Service)

Annuaire des étudiants.
{
  "_id": "ObjectId(...)",
  "name": "X",
  "email": "X@test.com"
}

3.3. Collection grades (Grade Service)

Notes attribuées.

{
  "_id": "ObjectId(...)",
  "student_id": "X", // Lien lâche (Loose coupling) via le nom
  "course_id": "MATH101",
  "grade": 18.5,
  "type": "Exam",
  "teacher_id": "prof_smith"
}

4. Interfaces API (Endpoints)
4.1. REST APIs

Ces services communiquent en JSON.

Auth Service (/auth)

    POST /register : Créer un compte (username, password, role).

    POST /login : Récupérer un Token JWT.

Student Service (/api/students)

    GET / : Liste de tous les étudiants.

    POST / : Ajouter un étudiant (Admin seulement).

    DELETE /:id : Supprimer un étudiant.

Grade Service (/api/grades)

    GET / : Liste de toutes les notes.

    POST / : Ajouter une note.

    DELETE /:id : Supprimer une note.

4.2. SOAP APIs (Web Services)

Ces services utilisent XML (WSDL).

Course Service (Java)

    WSDL : http://localhost:8080/api/courses/ws/courses?wsdl

    Opération : addCourse(id, name, description, credits)

    Opération : getAllCourses()

Billing Service (.NET)

    WSDL : http://localhost:8080/api/billing/billing.asmx?wsdl

    Opération : ProcessPayment(studentId, amount, currency)

5. Sécurité (JWT & Gateway)
5.1. Flux d'Authentification

    L'utilisateur s'identifie via /auth/login.

    Le serveur génère un Token JWT (JSON Web Token) signé contenant :

        sub : nom d'utilisateur.

        role : droits d'accès.

        exp : date d'expiration (10 heures).

5.2. Filtrage (Gateway)

L'API Gateway agit comme un pare-feu applicatif.

    AuthenticationFilter : Intercepte toutes les requêtes vers /api/*.*/

    Vérifie la présence du Header Authorization: Bearer <token>.

    Valide la signature du token via l'Auth Service.

    Si valide ➔ Passe la requête au microservice.

    Si invalide ➔ Retourne 401 Unauthorized.

6. Déploiement & Orchestration

Le projet utilise Docker Compose pour l'orchestration.

    Réseau : Un bridge network nommé soa-network est créé pour permettre la résolution DNS interne (ex: le Gateway peut appeler http://student-service:3000).

    Persistance : Un volume Docker mongo-data est monté sur /data/db pour que les données survivent au redémarrage des conteneurs.

    Multi-Stage Builds : Les Dockerfiles utilisent des builds multi-étapes (ex: Maven Build ➔ JRE Runtime) pour minimiser la taille des images finales.