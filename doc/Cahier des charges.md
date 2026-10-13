# Cahier des charges – Projet Fishkeeper

# 1\. Contexte & Définition du besoin

Dans le cadre de la 3e année de BUT Informatique, le projet Fishkeeper a pour objectif de concevoir une application web open source destinée aux aquariophiles débutants comme expérimentés.

L'aquariophilie nécessite une rigueur constante : suivi de l'équilibre biologique (cycle de l'azote, pH, dureté), gestion des espèces et maintenance du matériel. Aujourd'hui, les passionnés jonglent souvent entre carnets de notes, tableurs et calculatrices en ligne ou différentes applications permettant chacune quelque chose de précis. Ceci constitue donc un très grand facteur de loupé, rendant la survie et la traçabilité à long terme inasurable.

Fishkeeper centralise ces informations au sein d'un outil unique, ergonomique et entièrement autonome, déployable sur la machine de l'utilisateur sans dépendance à un service cloud propriétaire.

# 2\. Objectifs du projet

1. **Fournir un outil complet de suivi :** Permettre la gestion multi-aquariums avec journal de bord, historique d'analyses physico-chimiques et gestion du vivant (poissons, invertébrés, plantes).  
2. **Garantir l'indépendance :** Développer un produit open source sous licence libre, exécutable en local (auto-hébergé) pour garantir la maîtrise des données.  
3. **Assurer la fiabilité sanitaire des bacs :** Proposer un système d'alertes visuelles automatisées en cas de dérive des paramètres critiques comme un grand changement de température ou de dureté.  
4. **Appliquer une démarche logicielle professionnelle :** Mettre en œuvre un cycle de vie complet.

# 3\. Périmètre fonctionnel

## 3.1. Cœur métier 

* **Gestion des comptes & Espaces :**  
  * Authentification simple et gestion des profils.  
  * Gestion multi-bacs : création, modification et archivage de plusieurs aquariums (nom, volume brut/net, type d'eau : douce / de mer, biotope, date de mise en eau).  
* **Suivi des paramètres d’eau :**  
  * Saisie datée des relevés clés : Température, pH, Nitrites (NO2), Nitrates (NO3), Ammonium/Ammoniac (NH4/NH3), Dureté globale (GH) et Dureté carbonatée (KH).  
  * Visualisation chronologique et graphique (courbes d'évolution dans le temps pour identifier rapidement les tendances et dérives).  
* **Valeurs cibles & Alertes :**  
  * Définition de seuils de tolérance (plages min / max) adaptés au biotope ou configurés manuellement.  
  * Indicateurs visuels clairs (codes couleurs / alertes au tableau de bord) en cas de dépassement.  
* **Inventaire du vivant :**  
  * Recensement par aquarium : poissons, invertébrés, coraux, plantes.  
  * Suivi des effectifs (quantités), dates d'introduction et notes d'observation.  
* **Carnet de maintenance :**  
  * Planification et validation des tâches récurrentes : changements d'eau partiels, nettoyage de la filtration, taille des plantes, remplacement d'éclairage.  
  * Historique des interventions réalisées.

## 3.2. Évolutions & Modules optionnels 

* **Inventaire du matériel :** Suivi des équipements par bac (modèle de filtre, débit, puissance de chauffage, type d'éclairage, injection de CO2) et alertes d'usure.  
* **Galerie photo évolutive :** Suivi photographique régulier pour observer la croissance des plantes, l'évolution du bac et l'état des coraux/poissons.  
* **Assistant de compatibilité :** Vérification automatique des paramètres requis pour chaque espèce afin d'éviter la cohabitation d'espèces incompatibles ou l’introduction d’une espèce dans un biotope inadapté. Ajout d’un menu de suggestion d’ajout  
* **Export & Sauvegarde :** Export des données (CSV/JSON) et restauration de sauvegarde en un clic.

# 4\. Contraintes techniques & Non-fonctionnelles

* **Déploiement local sans friction :**  
  * L'application doit pouvoir être installée et lancée facilement via Docker / Docker Compose.  
* **Architecture recommandée :**  
  * *Frontend :* Moderne, réactif et optimisé pour desktop/tablette (ex. Next.js, React).  
  * *Backend & Données :* API structurée, ORM type Prisma, base relationnelle PostgreSQL ou SqLite car petit flux.  
* **Ergonomie & Accessibilité :**  
  * Interface claire et intuitive, adaptée à un usage rapide au bord du bac (saisie facilitée depuis un mobile/tablette sur le réseau local).

# 5\. Livrables attendus

1. **Dépôt Git complet :** Code source versionné, structuré et documenté.  
2. Conteneurisation : Fichiers de configuration (Dockerfile, docker-compose.yml) opérationnels.  
3. **Documentation technique & utilisateur :**  
   * Guide d’installation pas-à-pas pour une exécution locale.  
   * Script d'initialisation / jeu de données de test simulant un aquarium réel avec historique de mesures.  
4. **Dossier de conception :** Schéma de base de données entités-associations / modèle relationnel et choix d'architecture.  
5. **Démonstration :** Présentation du cycle complet sur un cas concret d'aquarium.

