const API_URL = "https://script.google.com/macros/s/AKfycbzOX9uOVJOuBJPM8JMMLEeE03ZILXHspaBIugCrnbvgOolLDsIlhKYHwsZmntf7YK45/exec";

// Charger toutes les données depuis Google Sheets
async function chargerDepuisGoogleSheets() {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Transformer le tableau Google Sheets → structure listeMetiers
    const metiersMap = {};

    data.forEach(row => {
        const nom = row["Métier"];
        if (!metiersMap[nom]) {
            metiersMap[nom] = {
                nom,
                codeM: row["CodeM"] || "",
                taux: row["Taux"] || "",
                centres: [],
                entreprises: [],
                fichiers: []
            };
        }

        if (row["Centre"]) {
            metiersMap[nom].centres.push({
                nom: row["Centre"],
                taux: row["TauxCentre"] || ""
            });
        }

        if (row["Entreprise"]) {
            metiersMap[nom].entreprises.push({
                nom: row["Entreprise"],
                email: row["Email"] || "Email non envoyé",
                reponse: row["Reponse"] || "En attente"
            });
        }

        if (row["FichierNom"]) {
            metiersMap[nom].fichiers.push({
                nom: row["FichierNom"],
                type: row["FichierType"],
                contenu: row["FichierContenu"]
            });
        }
    });

    listeMetiers = Object.values(metiersMap);
    afficherMetiers();
}

// Envoyer une action vers Google Sheets
async function envoyerVersGoogleSheets(action, payload) {
    await fetch(API_URL + "?action=" + action, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
    });
}

// ==========================================
// 1. DÉCLARATION DES ÉCRANS ET ÉLÉMENTS
// ==========================================

const ecranAccueil = document.getElementById('ecran-accueil');
const ecranMetier = document.getElementById('ecran-metier');
const ecranCentre = document.getElementById('ecran-centre');
const ecranEntreprise = document.getElementById('ecran-entreprise');
const ecranAutre = document.getElementById('ecran-autre');

// Éléments Écran 2 (Métier)
const titreMetier = document.querySelector('#ecran-metier h1');
const btnRetourAccueil = document.querySelector('#ecran-metier .btn-retour');
const inputCodeM = document.getElementById('input-code-m');
const inputTaux = document.getElementById('input-taux');

// Boutons d'action Écran 2
const btnCentre = document.getElementById('btn-centre');
const btnEntreprise = document.getElementById('btn-entreprise');
const btnAutre = document.getElementById('btn-autre');
const retoursMetier = document.querySelectorAll('.btn-retour-metier');

// Éléments Écran 1 (Accueil)
const inputNouveauMetier = document.getElementById('input-nouveau-metier');
const btnAjouter = document.getElementById('btn-ajouter');
const conteneurMetiers = document.querySelector('.liste-metiers');

// Éléments Écran 3 (Centres)
const inputCentre = document.getElementById('input-centre');
const inputTauxCentre = document.getElementById('input-taux-centre');
const btnAjouterCentre = document.getElementById('btn-ajouter-centre');
const listeCentres = document.getElementById('liste-centres');

// Éléments Écran 4 (Entreprises)
const inputEntreprise = document.getElementById('input-entreprise');
const btnAjouterEntreprise = document.getElementById('btn-ajouter-entreprise');
const listeEntreprises = document.getElementById('liste-entreprises');

// Éléments Écran 5 (Fichiers)
const inputFichier = document.getElementById('input-fichier');
const listeFichiers = document.getElementById('liste-fichiers');

let indexMetierActuel = -1;


// ==========================================
// 2. INITIALISATION ET SAUVEGARDE
// ==========================================

let listeMetiers = []; // sera rempli par Google Sheets

const API_URL = "https://script.google.com/macros/s/AKfycbwYhKyyaCVxFRuUdFr911-cajImRFcfqZX4j0aW8h31buegPbXtlmvn_famBl5a-02N/exec";

async function chargerDepuisGoogleSheets() {
    const response = await fetch(API_URL);
    const data = await response.json();

    const metiersMap = {};

    data.forEach(row => {
        const nom = row["Métier"];
        if (!metiersMap[nom]) {
            metiersMap[nom] = {
                nom,
                codeM: row["CodeM"] || "",
                taux: row["Taux"] || "",
                centres: [],
                entreprises: [],
                fichiers: []
            };
        }

        if (row["Centre"]) {
            metiersMap[nom].centres.push({
                nom: row["Centre"],
                taux: row["TauxCentre"] || ""
            });
        }

        if (row["Entreprise"]) {
            metiersMap[nom].entreprises.push({
                nom: row["Entreprise"],
                email: row["Email"] || "Email non envoyé",
                reponse: row["Reponse"] || "En attente"
            });
        }

        if (row["FichierNom"]) {
            metiersMap[nom].fichiers.push({
                nom: row["FichierNom"],
                type: row["FichierType"],
                contenu: row["FichierContenu"]
            });
        }
    });

    listeMetiers = Object.values(metiersMap);
    afficherMetiers();
}

async function envoyerVersGoogleSheets(action, payload) {
    await fetch(API_URL + "?action=" + action, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
    });
}

function sauvegarderMetiers() {
    // Ne fait plus rien : tout passe par Google Sheets
}



// ==========================================
// 3. FONCTIONS D'AFFICHAGE PAR MÉTIER
// ==========================================

function afficherMetiers() {
    sauvegarderMetiers();
    conteneurMetiers.innerHTML = '';

    listeMetiers.forEach((metierObj, index) => {
        const nouveauBouton = document.createElement('button');
        nouveauBouton.classList.add('btn-metier');
        nouveauBouton.textContent = metierObj.nom;

        nouveauBouton.addEventListener('click', () => {
            indexMetierActuel = index;
            titreMetier.textContent = metierObj.nom;
            inputCodeM.value = metierObj.codeM;
            inputTaux.value = metierObj.taux;

            ecranAccueil.style.display = 'none';
            ecranMetier.style.display = 'block';
        });

        // Suppression d'un métier avec confirmation
        nouveauBouton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Voulez-vous vraiment supprimer le métier "${metierObj.nom}" ?`)) {
                listeMetiers.splice(index, 1);
                afficherMetiers();
            }
        });

        conteneurMetiers.appendChild(nouveauBouton);
    });
}

function afficherFichiers() {
    if (indexMetierActuel === -1) return;
    listeFichiers.innerHTML = '';

    listeMetiers[indexMetierActuel].fichiers.forEach((fichierObj, i) => {
        const li = document.createElement('li');

        if (fichierObj.type && fichierObj.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = fichierObj.contenu;
            img.style.maxWidth = '100px';
            img.style.display = 'block';
            img.style.margin = '5px 0';
            li.appendChild(img);
        }

        const texteNom = document.createElement('span');
        texteNom.textContent = fichierObj.nom + " ";
        li.appendChild(texteNom);

        // OUVERTURE DU FICHIER EN GRAND
        li.style.cursor = "pointer";
        li.addEventListener('click', () => {
            ouvrirFichier(fichierObj);
        });

        // Bouton suppression
        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";
        btnSuppr.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche d'ouvrir la modale en cliquant sur ❌
            if (confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${fichierObj.nom}" ?`)) {
                listeMetiers[indexMetierActuel].fichiers.splice(i, 1);
                sauvegarderMetiers();
                afficherFichiers();
            }
        });

        li.appendChild(btnSuppr);
        listeFichiers.appendChild(li);
    });
}

function afficherCentres() {
    if (indexMetierActuel === -1) return;
    listeCentres.innerHTML = '';

    listeMetiers[indexMetierActuel].centres.forEach((centreObj, i) => {
        const li = document.createElement('li');

        const nomSpan = document.createElement('strong');
        nomSpan.textContent = centreObj.nom + " ";

        const tauxSpan = document.createElement('span');
        tauxSpan.textContent = centreObj.taux ? `(${centreObj.taux})` : "(taux non défini)";

        // Bouton suppression
        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";
        btnSuppr.addEventListener('click', () => {
            if (confirm(`Supprimer le centre "${centreObj.nom}" ?`)) {
                listeMetiers[indexMetierActuel].centres.splice(i, 1);
                sauvegarderMetiers();
                afficherCentres();
            }
        });

        li.appendChild(nomSpan);
        li.appendChild(tauxSpan);
        li.appendChild(btnSuppr);
        listeCentres.appendChild(li);
    });
}

function afficherEntreprises() {
    if (indexMetierActuel === -1) return;
    listeEntreprises.innerHTML = '';

    listeMetiers[indexMetierActuel].entreprises.forEach((entrepriseObj, i) => {
        const li = document.createElement('li');

        const nomSpan = document.createElement('strong');
        nomSpan.textContent = entrepriseObj.nom + " ";

        // Select pour l'Email avec confirmation
        selEmail.addEventListener('change', () => {
    if (indexMetierActuel !== -1 && entrepriseObj) {
        envoyerVersGoogleSheets("modifier", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Entreprise: entrepriseObj.nom,
            Email: selEmail.value
        });
    }
});


        // Select pour la Réponse avec confirmation
        selReponse.addEventListener('change', () => {
    if (indexMetierActuel !== -1 && entrepriseObj) {
        envoyerVersGoogleSheets("modifier", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Entreprise: entrepriseObj.nom,
            Reponse: selReponse.value
        });
    }
});



        // Bouton suppression avec confirmation
        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";
        btnSuppr.addEventListener('click', () => {
            if (confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${entrepriseObj.nom}" ?`)) {
                listeMetiers[indexMetierActuel].entreprises.splice(i, 1);
                sauvegarderMetiers();
                afficherEntreprises();
            }
        });

        li.appendChild(nomSpan);
        li.appendChild(selEmail);
        li.appendChild(selReponse);
        li.appendChild(btnSuppr);
        listeEntreprises.appendChild(li);
    });
}

function afficherFichiers() {
    if (indexMetierActuel === -1) return;
    listeFichiers.innerHTML = '';

    listeMetiers[indexMetierActuel].fichiers.forEach((fichierObj, i) => {
        const li = document.createElement('li');
        li.style.cursor = "pointer";

        // Image miniature
        if (fichierObj.type && fichierObj.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = fichierObj.contenu;
            img.style.maxWidth = '100px';
            img.style.display = 'block';
            img.style.margin = '5px 0';
            li.appendChild(img);
        }

        // Nom du fichier
        const texteNom = document.createElement('span');
        texteNom.textContent = fichierObj.nom + " ";
        li.appendChild(texteNom);

        // OUVERTURE DU FICHIER
        li.addEventListener('click', () => {
            ouvrirFichier(fichierObj);
        });

        // Bouton suppression
        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";

        // Empêche le clic sur ❌ d'ouvrir la modale
        btnSuppr.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${fichierObj.nom}" ?`)) {
                listeMetiers[indexMetierActuel].fichiers.splice(i, 1);
                sauvegarderMetiers();
                afficherFichiers();
            }
        });

        li.appendChild(btnSuppr);
        listeFichiers.appendChild(li);
    });
}


// ==========================================
// 4. ÉVÉNEMENTS D'AJOUT ET MODIFICATION
// ==========================================

btnAjouter.addEventListener('click', () => {
    const nomMetier = inputNouveauMetier.value.trim();
    if (nomMetier !== '') {
        envoyerVersGoogleSheets("ajouter", {
            Métier: nomMetier
        });
        chargerDepuisGoogleSheets();
        inputNouveauMetier.value = '';
    }
});


// Confirmation de modification pour Code M
inputCodeM.addEventListener('change', () => {
    if (indexMetierActuel !== -1) {
        const nouvelleValeur = inputCodeM.value.trim();

        envoyerVersGoogleSheets("modifier", {
            Métier: listeMetiers[indexMetierActuel].nom,
            CodeM: nouvelleValeur
        });
    }
});


// Confirmation de modification pour Taux
inputTaux.addEventListener('change', () => {
    if (indexMetierActuel !== -1) {
        const nouvelleValeur = inputTaux.value.trim();

        envoyerVersGoogleSheets("modifier", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Taux: nouvelleValeur
        });
    }
});


// Ajout Centre
btnAjouterCentre.addEventListener('click', () => {
    const nomCentre = inputCentre.value.trim();
    const tauxCentre = inputTauxCentre.value.trim();

    if (nomCentre !== '' && indexMetierActuel !== -1) {
        envoyerVersGoogleSheets("ajouter", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Centre: nomCentre,
            TauxCentre: tauxCentre
        });

        chargerDepuisGoogleSheets();

        inputCentre.value = '';
        inputTauxCentre.value = '';
    }
});


// Ajout Entreprise
btnAjouterEntreprise.addEventListener('click', () => {
    const nomEntreprise = inputEntreprise.value.trim();

    if (nomEntreprise !== '' && indexMetierActuel !== -1) {
        envoyerVersGoogleSheets("ajouter", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Entreprise: nomEntreprise,
            Email: "Email non envoyé",
            Reponse: "En attente"
        });

        chargerDepuisGoogleSheets();

        inputEntreprise.value = '';
    }
});


// Ajout Fichier
inputFichier.addEventListener('change', (e) => {
    const fichier = e.target.files[0];
    if (!fichier || indexMetierActuel === -1) return;

    const reader = new FileReader();
    reader.onload = () => {
        envoyerVersGoogleSheets("ajouter", {
            Métier: listeMetiers[indexMetierActuel].nom,
            FichierNom: fichier.name,
            FichierType: fichier.type,
            FichierContenu: reader.result
        });

        chargerDepuisGoogleSheets();
    };

    reader.readAsDataURL(fichier);
});



// ==========================================
// 5. NAVIGATION ENTRE LES ÉCRANS
// ==========================================

btnRetourAccueil.addEventListener('click', () => {
    ecranMetier.style.display = 'none';
    ecranAccueil.style.display = 'block';
});

btnCentre.addEventListener('click', () => {
    afficherCentres();
    ecranMetier.style.display = 'none';
    ecranCentre.style.display = 'block';
});

btnEntreprise.addEventListener('click', () => {
    afficherEntreprises();
    ecranMetier.style.display = 'none';
    ecranEntreprise.style.display = 'block';
});

btnAutre.addEventListener('click', () => {
    afficherFichiers();
    ecranMetier.style.display = 'none';
    ecranAutre.style.display = 'block';
});

retoursMetier.forEach(bouton => {
    bouton.addEventListener('click', () => {
        ecranCentre.style.display = 'none';
        ecranEntreprise.style.display = 'none';
        ecranAutre.style.display = 'none';
        ecranMetier.style.display = 'block';
    });
});

afficherMetiers();

// Création de la modale
const modal = document.createElement('div');
modal.id = 'modal-fichier';
modal.innerHTML = `<div class="contenu"></div>`;
document.body.appendChild(modal);

// Fermer la modale en cliquant autour
modal.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.querySelector('.contenu').innerHTML = '';
});

// Fonction pour ouvrir un fichier
function ouvrirFichier(fichierObj) {
    modal.style.display = 'flex';
    const zone = modal.querySelector('.contenu');

    if (fichierObj.type.startsWith('image/')) {
        zone.innerHTML = `<img id="zoom-image" src="${fichierObj.contenu}" alt="${fichierObj.nom}">`;

        panzoomScript.onload = () => {
            const img = document.getElementById('zoom-image');
            const panzoom = Panzoom(img, {
                maxScale: 5,
                minScale: 1,
                contain: 'outside'
            });

            img.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);
        };
    } 
    else if (fichierObj.type.includes("pdf")) {
        zone.innerHTML = `<iframe src="${fichierObj.contenu}"></iframe>`;
    } 
    else {
        zone.innerHTML = `<p style="color:white;">Impossible d'afficher ce type de fichier.</p>`;
    }
}

const panzoomScript = document.createElement('script');
panzoomScript.src = "https://unpkg.com/@panzoom/panzoom/dist/panzoom.min.js";
document.head.appendChild(panzoomScript);
