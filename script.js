const API_URL = "https://script.google.com/macros/s/AKfycbzOX9uOVJOuBJPM8JMMLEeE03ZILXHspaBIugCrnbvgOolLDsIlhKYHwsZmntf7YK45/exec";

let listeMetiers = [];
let indexMetierActuel = -1;

// Charger toutes les données
async function chargerDepuisGoogleSheets() {
    try {
        const response = await fetch(API_URL + "?action=charger");
        const data = await response.json();

        // Sécurité : Vérifier que data est bien un tableau
        if (!Array.isArray(data)) {
            console.error("Réponse invalide du serveur :", data);
            return;
        }

        const metiersMap = {};

        data.forEach(row => {
            const nom = row["Métier"];
            if (!nom) return;

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
    } catch (e) {
        console.error("Erreur lors du chargement :", e);
    }
}

// Envoyer vers Google Sheets sans déclencher de requête CORS OPTIONS
async function envoyerVersGoogleSheets(action, payload) {
    try {
        const formData = new URLSearchParams();
        formData.append("payload", JSON.stringify(payload));

        await fetch(API_URL + "?action=" + action, {
            method: "POST",
            body: formData // Pas de header personnalisé = pas de blocage CORS
        });
    } catch (e) {
        console.error("Erreur lors de l'envoi :", e);
    }
}
// ==========================================
// 1. ÉCRANS ET ÉLÉMENTS
// ==========================================

const ecranAccueil = document.getElementById('ecran-accueil');
const ecranMetier = document.getElementById('ecran-metier');
const ecranCentre = document.getElementById('ecran-centre');
const ecranEntreprise = document.getElementById('ecran-entreprise');
const ecranAutre = document.getElementById('ecran-autre');

const titreMetier = document.querySelector('#ecran-metier h1');
const btnRetourAccueil = document.querySelector('#ecran-metier .btn-retour');
const inputCodeM = document.getElementById('input-code-m');
const inputTaux = document.getElementById('input-taux');

const btnCentre = document.getElementById('btn-centre');
const btnEntreprise = document.getElementById('btn-entreprise');
const btnAutre = document.getElementById('btn-autre');
const retoursMetier = document.querySelectorAll('.btn-retour-metier');

const inputNouveauMetier = document.getElementById('input-nouveau-metier');
const btnAjouter = document.getElementById('btn-ajouter');
const conteneurMetiers = document.querySelector('.liste-metiers');

const inputCentre = document.getElementById('input-centre');
const inputTauxCentre = document.getElementById('input-taux-centre');
const btnAjouterCentre = document.getElementById('btn-ajouter-centre');
const listeCentres = document.getElementById('liste-centres');

const inputEntreprise = document.getElementById('input-entreprise');
const btnAjouterEntreprise = document.getElementById('btn-ajouter-entreprise');
const listeEntreprises = document.getElementById('liste-entreprises');

const inputFichier = document.getElementById('input-fichier');
const listeFichiers = document.getElementById('liste-fichiers');

// ==========================================
// 2. AFFICHAGE DES MÉTIERS
// ==========================================

function afficherMetiers() {
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

        nouveauBouton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Supprimer le métier "${metierObj.nom}" ?`)) {
                envoyerVersGoogleSheets("supprimer", { Métier: metierObj.nom });
                chargerDepuisGoogleSheets();
            }
        });

        conteneurMetiers.appendChild(nouveauBouton);
    });
}

// ==========================================
// 3. AFFICHAGE DES CENTRES
// ==========================================

function afficherCentres() {
    if (indexMetierActuel === -1) return;
    listeCentres.innerHTML = '';

    listeMetiers[indexMetierActuel].centres.forEach((centreObj) => {
        const li = document.createElement('li');

        const nomSpan = document.createElement('strong');
        nomSpan.textContent = centreObj.nom + " ";

        const tauxSpan = document.createElement('span');
        tauxSpan.textContent = centreObj.taux ? `(${centreObj.taux})` : "(taux non défini)";

        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";
        btnSuppr.addEventListener('click', () => {
            if (confirm(`Supprimer le centre "${centreObj.nom}" ?`)) {
                envoyerVersGoogleSheets("modifier", {
                    Métier: listeMetiers[indexMetierActuel].nom,
                    Centre: centreObj.nom,
                    TauxCentre: ""
                });
                chargerDepuisGoogleSheets();
            }
        });

        li.appendChild(nomSpan);
        li.appendChild(tauxSpan);
        li.appendChild(btnSuppr);
        listeCentres.appendChild(li);
    });
}

// ==========================================
// 4. AFFICHAGE DES ENTREPRISES
// ==========================================

function afficherEntreprises() {
    if (indexMetierActuel === -1) return;
    listeEntreprises.innerHTML = '';

    listeMetiers[indexMetierActuel].entreprises.forEach((entrepriseObj) => {
        const li = document.createElement('li');

        const nomSpan = document.createElement('strong');
        nomSpan.textContent = entrepriseObj.nom + " ";

        const selEmail = document.createElement('select');
        selEmail.innerHTML = `
            <option value="Email non envoyé">Email non envoyé</option>
            <option value="Email envoyé">Email envoyé</option>
        `;
        selEmail.value = entrepriseObj.email;

        selEmail.addEventListener('change', () => {
            envoyerVersGoogleSheets("modifier", {
                Métier: listeMetiers[indexMetierActuel].nom,
                Entreprise: entrepriseObj.nom,
                Email: selEmail.value
            });
        });

        const selReponse = document.createElement('select');
        selReponse.innerHTML = `
            <option value="En attente">En attente</option>
            <option value="Positive">Positive</option>
            <option value="Négative">Négative</option>
        `;
        selReponse.value = entrepriseObj.reponse;

        selReponse.addEventListener('change', () => {
            envoyerVersGoogleSheets("modifier", {
                Métier: listeMetiers[indexMetierActuel].nom,
                Entreprise: entrepriseObj.nom,
                Reponse: selReponse.value
            });
        });

        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";
        btnSuppr.addEventListener('click', () => {
            if (confirm(`Supprimer "${entrepriseObj.nom}" ?`)) {
                envoyerVersGoogleSheets("modifier", {
                    Métier: listeMetiers[indexMetierActuel].nom,
                    Entreprise: entrepriseObj.nom,
                    Email: "",
                    Reponse: ""
                });
                chargerDepuisGoogleSheets();
            }
        });

        li.appendChild(nomSpan);
        li.appendChild(selEmail);
        li.appendChild(selReponse);
        li.appendChild(btnSuppr);
        listeEntreprises.appendChild(li);
    });
}

// ==========================================
// 5. AFFICHAGE DES FICHIERS
// ==========================================

function afficherFichiers() {
    if (indexMetierActuel === -1) return;
    listeFichiers.innerHTML = '';

    listeMetiers[indexMetierActuel].fichiers.forEach((fichierObj) => {
        const li = document.createElement('li');
        li.style.cursor = "pointer";

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

        li.addEventListener('click', () => {
            ouvrirFichier(fichierObj);
        });

        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = "❌";

        btnSuppr.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${fichierObj.nom}" ?`)) {
                envoyerVersGoogleSheets("modifier", {
                    Métier: listeMetiers[indexMetierActuel].nom,
                    FichierNom: fichierObj.nom,
                    FichierType: "",
                    FichierContenu: ""
                });
                chargerDepuisGoogleSheets();
            }
        });

        li.appendChild(btnSuppr);
        listeFichiers.appendChild(li);
    });
}

// ==========================================
// 6. AJOUTS
// ==========================================

btnAjouter.addEventListener('click', async () => {
    const nomMetier = inputNouveauMetier.value.trim();
    if (nomMetier !== '') {
        await envoyerVersGoogleSheets("ajouter", { Métier: nomMetier });
        await chargerDepuisGoogleSheets();
        inputNouveauMetier.value = '';
    }
});

inputCodeM.addEventListener('change', () => {
    if (indexMetierActuel !== -1) {
        envoyerVersGoogleSheets("modifier", {
            Métier: listeMetiers[indexMetierActuel].nom,
            CodeM: inputCodeM.value.trim()
        });
    }
});

inputTaux.addEventListener('change', () => {
    if (indexMetierActuel !== -1) {
        envoyerVersGoogleSheets("modifier", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Taux: inputTaux.value.trim()
        });
    }
});

btnAjouterCentre.addEventListener('click', async () => {
    const nomCentre = inputCentre.value.trim();
    const tauxCentre = inputTauxCentre.value.trim();

    if (nomCentre !== '' && indexMetierActuel !== -1) {
        await envoyerVersGoogleSheets("ajouter", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Centre: nomCentre,
            TauxCentre: tauxCentre
        });

        await chargerDepuisGoogleSheets();

        inputCentre.value = '';
        inputTauxCentre.value = '';
    }
});

btnAjouterEntreprise.addEventListener('click', async () => {
    const nomEntreprise = inputEntreprise.value.trim();

    if (nomEntreprise !== '' && indexMetierActuel !== -1) {
        await envoyerVersGoogleSheets("ajouter", {
            Métier: listeMetiers[indexMetierActuel].nom,
            Entreprise: nomEntreprise,
            Email: "Email non envoyé",
            Reponse: "En attente"
        });

        await chargerDepuisGoogleSheets();

        inputEntreprise.value = '';
    }
});

inputFichier.addEventListener('change', (e) => {
    const fichier = e.target.files[0];
    if (!fichier || indexMetierActuel === -1) return;

    const reader = new FileReader();
    reader.onload = async () => {
        await envoyerVersGoogleSheets("ajouter", {
            Métier: listeMetiers[indexMetierActuel].nom,
            FichierNom: fichier.name,
            FichierType: fichier.type,
            FichierContenu: reader.result
        });

        await chargerDepuisGoogleSheets();
    };

    reader.readAsDataURL(fichier);
});

// ==========================================
// 7. NAVIGATION
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

// ==========================================
// 8. MODALE FICHIERS
// ==========================================

const modal = document.createElement('div');
modal.id = 'modal-fichier';
modal.style.display = 'none';
modal.innerHTML = `<div class="contenu"></div>`;
document.body.appendChild(modal);

modal.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.querySelector('.contenu').innerHTML = '';
});

function ouvrirFichier(fichierObj) {
    modal.style.display = 'flex';
    const zone = modal.querySelector('.contenu');

    if (fichierObj.type && fichierObj.type.startsWith('image/')) {
        zone.innerHTML = `<img id="zoom-image" src="${fichierObj.contenu}" alt="${fichierObj.nom}">`;

        panzoomScript.onload = () => {
            const img = document.getElementById('zoom-image');
            if (typeof Panzoom !== 'undefined') {
                const panzoom = Panzoom(img, {
                    maxScale: 5,
                    minScale: 1,
                    contain: 'outside'
                });
                img.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);
            }
        };
    } 
    else if (fichierObj.type && fichierObj.type.includes("pdf")) {
        zone.innerHTML = `<iframe src="${fichierObj.contenu}"></iframe>`;
    } 
    else {
        zone.innerHTML = `<p style="color:white;">Impossible d'afficher ce type de fichier.</p>`;
    }
}

const panzoomScript = document.createElement('script');
panzoomScript.src = "https://unpkg.com/@panzoom/panzoom/dist/panzoom.min.js";
document.head.appendChild(panzoomScript);

// ==========================================
// 9. CHARGEMENT INITIAL
// ==========================================

chargerDepuisGoogleSheets();
