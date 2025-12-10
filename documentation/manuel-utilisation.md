# 📖 Manuel d'Utilisation - Système de Gestion Universitaire Distribué

Bienvenue dans le manuel d'utilisation de la plateforme universitaire SOA. Ce document vous guidera à travers l'installation, le démarrage et l'utilisation des fonctionnalités de l'application (Gestion des étudiants, Notes, Cours et Facturation).

---

## 🚀 1. Installation et Démarrage

### Prérequis
* **Docker** et **Docker Compose** doivent être installés sur votre machine.
* Les ports `8080`, `8088`, `8090`, `3000`, `5000` doivent être libres.

### Démarrage Rapide
1.1  Ouvrez un terminal à la racine du projet (`projet-soa-universite`).
1.2  Lancez la commande suivante pour construire et démarrer tous les microservices :

```bash
sudo docker compose up -d --build

1.3 Attendez environ 30 à 60 secondes que tous les conteneurs soient opérationnels (notamment api-gateway et auth-service qui prennent un peu de temps à démarrer).

2. Accès à l'Application

    Interface Utilisateur (Frontend) : http://localhost:8090

    API Gateway (Backend) : http://localhost:8080

3. Gestion des Rôles (RBAC)

Le système gère trois niveaux d'accès. Vous pouvez créer vos propres utilisateurs via le bouton "Register" ou utiliser les scénarios ci-dessous.

Rôle,Permissions Principales
ADMIN,"Accès total : Ajout d'étudiants, Cours, Notes et Facturation (Billing)."
TEACHER (Enseignant),Ajout de Cours et de Notes. Consultation des étudiants. Pas de Facturation.
STUDENT (Étudiant),"Lecture seule : Voir ses notes, les cours disponibles et ses factures. Option de Paiement."

4. Scénario de Test Complet (Guide Pas à Pas)

Pour tester l'ensemble des fonctionnalités du projet, nous vous recommandons de suivre ce scénario :
Étape 1 : Initialisation (Rôle Admin)

    Allez sur http://localhost:8090.

    Cliquez sur Register.

    Créez un compte :

        Username : admin

        Password : 123

        Role : ADMIN

    Connectez-vous avec ce compte.

    Allez dans l'onglet Students.

        Remplissez le formulaire (ex: Name: Hamdi, Email: hamdi@test.com) et cliquez sur Add New Student.

        Résultat : L'étudiant apparaît dans la liste.

Étape 2 : Création de Contenu (Rôle Enseignant)

    Déconnectez-vous (Logout) et cliquez sur Register.

    Créez un compte :

        Username : prof

        Password : 123

        Role : TEACHER

    Connectez-vous.

    Allez dans l'onglet Courses (SOAP).

        Ajoutez un cours (ex: ID: MATH101, Title: Algebra, Credits: 4).

        Note Technique : Cette action envoie une requête XML SOAP au service Java.

    Allez dans l'onglet Students.

        Cliquez sur le bouton "➕ Add Grade" à côté de l'étudiant Hamdi.

        Vous êtes redirigé vers l'onglet Grades.

        Ajoutez une note (ex: Course: MATH101, Grade: 18.5, Type: Exam).

        Résultat : La note est ajoutée via le service Python.

Étape 3 : Consultation et Paiement (Rôle Étudiant)

    Déconnectez-vous et cliquez sur Register.

    Créez un compte Étudiant :

        Username : hamdi (Important : Utilisez le même nom que l'étudiant créé à l'étape 1 pour simuler le lien).

        Role : STUDENT

    Connectez-vous.

    Allez dans l'onglet Grades.

        Vous voyez votre note de 18.5 en lecture seule.

    Allez dans l'onglet Courses.

        Vous voyez le cours Algebra (sans formulaire d'ajout).

Étape 4 : Facturation (Polyglotte .NET)

    Reconnectez-vous en tant qu'ADMIN.

    Allez dans l'onglet Billing.

    Créez une facture pour hamdi d'un montant de 500.

    Déconnectez-vous et reconnectez-vous en tant que STUDENT (hamdi).

    Allez dans l'onglet Billing.

        Vous voyez la facture de 500$.

        Cliquez sur PAY NOW.

        Résultat : La requête part vers le service .NET (SOAP), le paiement est validé et la facture disparaît.


5. Dépannage (Troubleshooting)

Problème : La liste des étudiants ne charge pas (Erreur 500 ou 404).

    Cause : Le service student-service n'est peut-être pas prêt ou la base de données est vide.

    Solution : Vérifiez les logs avec sudo docker compose logs student-service. Assurez-vous d'avoir ajouté un étudiant en tant qu'Admin.

Problème : Bouton "Add Course" ne fait rien.

    Cause : Erreur de format SOAP.

    Solution : Vérifiez la console du navigateur (F12). Si c'est une erreur CORS, redémarrez la gateway : sudo docker compose restart api-gateway.

Problème : Je ne peux pas me connecter après un redémarrage de Docker.

    Cause : Persistance des données.

    Solution : Les utilisateurs sont sauvegardés dans MongoDB. Si vous avez supprimé le volume Docker, vous devez vous réinscrire.
