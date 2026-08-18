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

const metiersParDefaut = [
    { nom: 'développeur web', codeM: '', taux: '', centres: [], entreprises: [], fichiers: [] },
    { nom: 'data analyste', codeM: '', taux: '', centres: [], entreprises: [], fichiers: [] }
];

let donneesBrutes = JSON.parse(localStorage.getItem('mesMetiers')) || metiersParDefaut;

let listeMetiers = donneesBrutes.map(item => {
    if (typeof item === 'string') {
        return { nom: item, codeM: '', taux: '', centres: [], entreprises: [], fichiers: [] };
    }
    return {
        nom: item.nom || '',
        codeM: item.codeM || '',
        taux: item.taux || '',
        centres: (item.centres || []).map(c => typeof c === 'string' ? { nom: c, taux: '' } : c),
        entreprises: (item.entreprises || []).map(e => typeof e === 'string' ? { nom: e, email: 'Email non envoyé', reponse: 'En attente' } : e),
        fichiers: item.fichiers || []
    };
});

function sauvegarderMetiers() {
    localStorage.setItem('mesMetiers', JSON.stringify(listeMetiers));
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
        const selEmail = document.createElement('select');
        selEmail.innerHTML = `
            <option value="Email non envoyé">Email non envoyé</option>
            <option value="Email envoyé">Email envoyé</option>
        `;
        selEmail.value = entrepriseObj.email || "Email non envoyé";
        
        selEmail.addEventListener('change', () => {
            const valeurPrécédente = entrepriseObj.email || "Email non envoyé";
            if (confirm(`Confirmer la modification du statut email pour "${entrepriseObj.nom}" ?`)) {
                listeMetiers[indexMetierActuel].entreprises[i].email = selEmail.value;
                sauvegarderMetiers();
            } else {
                selEmail.value = valeurPrécédente;
            }
        });

        // Select pour la Réponse avec confirmation
        const selReponse = document.createElement('select');
        selReponse.innerHTML = `
            <option value="En attente">En attente</option>
            <option value="Oui">Oui (Accepté)</option>
            <option value="Non">Non (Refusé)</option>
        `;
        selReponse.value = entrepriseObj.reponse || "En attente";
        
        selReponse.addEventListener('change', () => {
            const valeurPrécédente = entrepriseObj.reponse || "En attente";
            if (confirm(`Confirmer la modification de la réponse de stage pour "${entrepriseObj.nom}" ?`)) {
                listeMetiers[indexMetierActuel].entreprises[i].reponse = selReponse.value;
                sauvegarderMetiers();
            } else {
                selReponse.value = valeurPrécédente;
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
        listeMetiers.push({
            nom: nomMetier,
            codeM: '',
            taux: '',
            centres: [],
            entreprises: [],
            fichiers: []
        });
        afficherMetiers();
        inputNouveauMetier.value = '';
    }
});

// Confirmation de modification pour Code M
inputCodeM.addEventListener('change', () => {
    if (indexMetierActuel !== -1) {
        const valeurPrécédente = listeMetiers[indexMetierActuel].codeM;
        const nouvelleValeur = inputCodeM.value.trim();

        if (valeurPrécédente !== '' && valeurPrécédente !== nouvelleValeur) {
            if (confirm(`Modifier le Code M de "${valeurPrécédente}" à "${nouvelleValeur}" ?`)) {
                listeMetiers[indexMetierActuel].codeM = nouvelleValeur;
                sauvegarderMetiers();
            } else {
                inputCodeM.value = valeurPrécédente;
            }
        } else {
            listeMetiers[indexMetierActuel].codeM = nouvelleValeur;
            sauvegarderMetiers();
        }
    }
});

// Confirmation de modification pour Taux
inputTaux.addEventListener('change', () => {
    if (indexMetierActuel !== -1) {
        const valeurPrécédente = listeMetiers[indexMetierActuel].taux;
        const nouvelleValeur = inputTaux.value.trim();

        if (valeurPrécédente !== '' && valeurPrécédente !== nouvelleValeur) {
            if (confirm(`Modifier le Taux de "${valeurPrécédente}" à "${nouvelleValeur}" ?`)) {
                listeMetiers[indexMetierActuel].taux = nouvelleValeur;
                sauvegarderMetiers();
            } else {
                inputTaux.value = valeurPrécédente;
            }
        } else {
            listeMetiers[indexMetierActuel].taux = nouvelleValeur;
            sauvegarderMetiers();
        }
    }
});

// Ajout Centre
btnAjouterCentre.addEventListener('click', () => {
    const nomCentre = inputCentre.value.trim();
    const tauxCentre = inputTauxCentre.value.trim();
    if (nomCentre !== '' && indexMetierActuel !== -1) {
        listeMetiers[indexMetierActuel].centres.push({
            nom: nomCentre,
            taux: tauxCentre
        });
        sauvegarderMetiers();
        afficherCentres();
        inputCentre.value = '';
        inputTauxCentre.value = '';
    }
});

// Ajout Entreprise
btnAjouterEntreprise.addEventListener('click', () => {
    const nomEntreprise = inputEntreprise.value.trim();
    if (nomEntreprise !== '' && indexMetierActuel !== -1) {
        listeMetiers[indexMetierActuel].entreprises.push({
            nom: nomEntreprise,
            email: 'Email non envoyé',
            reponse: 'En attente'
        });
        sauvegarderMetiers();
        afficherEntreprises();
        inputEntreprise.value = '';
    }
});

// Ajout Fichier
inputFichier.addEventListener('change', () => {
    const fichier = inputFichier.files[0];
    if (fichier && indexMetierActuel !== -1) {
        const lecteur = new FileReader();
        lecteur.onload = function(e) {
            listeMetiers[indexMetierActuel].fichiers.push({
                nom: fichier.name,
                type: fichier.type,
                contenu: e.target.result
            });
            sauvegarderMetiers();
            afficherFichiers();
            inputFichier.value = '';
        };
        lecteur.readAsDataURL(fichier);
    }
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