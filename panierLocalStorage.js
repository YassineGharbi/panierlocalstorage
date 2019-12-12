// VARIABLE QUI VONT SERVIR A LA MANIPULATION DU PANIER
let affichageMagasin = "";
let boutonAjoutPanier = "";
let boutonPlus = "";
let produitSelectionne = "";
let tabPanier = [];
const percent = 5;

//------------------------------------------------------//
//            AFFFICHAGE DE LA BASE DE DONNEES          //
//------------------------------------------------------//

//AFFICHAGE DE LA BASE DE DONNEES
//UTILISATION D'AJAX POUR RECUPERER LES INFOS DU JSON
function affichageProduitsDispo() {
    let xhr = new XMLHttpRequest();
    let method = "GET";
    let url = "./dbPanier.json";
    xhr.open(method, url);
    xhr.onreadystatechange = function (event) {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                //J'AFFICHE LES ELEMENTS DU MAGASIN CAR SI JE LE MET A PART IL SE CHARGERA AVANT AJAX
                affichageMagasin = JSON.parse(this.responseText);
                affichageMagasin.forEach(element => {
                    document.getElementById("produitDispo").innerHTML += `<div class="prod">
                <div class="nomProd">${element.nomProduit}</div>
                <div class="infoProd">
                <img src="${element.imageProduit}" alt="produitZePhoneStore">
                Prix : ${element.prixProduit}€
                <button class="boutonAchat" value="${element.idProduit}">Ajouter au panier</button></div>
                </div>`
                });
                // JE DONNE UN EVENEMENT A CHAQUE BOUTON CREE
                boutonAjoutPanier = document.querySelectorAll(".boutonAchat");
                boutonAjoutPanier.forEach(element => {
                    element.addEventListener("click", qtePlusPanier);
                });
            } else {
                console.log(this.status);
                alert(`Erreur`)
            }
        }
    }
    xhr.send();
}
affichageProduitsDispo()

//------------------------------------------------------//
//            RECUPERATION DU LOCAL STORAGE             //
//------------------------------------------------------//

//RECUPERATION DU LOCAL STORAGE SI NON VIDE ET AFFICHAGE DANS LE HTML
function recupStorage() {
    let recupStoragepanier = localStorage.getItem(`storagePanier`);
    if (recupStoragepanier != null || recupStoragepanier != undefined) {
        tabPanier = JSON.parse(recupStoragepanier);
        tabPanier.forEach(element => {
            document.getElementById("listeProduitsPanier").innerHTML += `<div class="articlePanier">
            <div class="prodPanier">
            <img src="${element.imgProduitPanier}" alt="${element.nomProduitPanier}">
            <div>${element.nomProduitPanier}</div>
            </div>
        <p><button class="btnMoins" value="${element.idProduitPanier}">-</button> ${element.quantiteProduitPanier} <button class="btnPlus" value="${element.idProduitPanier}">+</button></p>
        <p>${element.prixProduitPanier}€</p>
        <p>${element.sousTotalProduitPanier}€ <button class="btnSup" value="${element.idProduitPanier}">X</button></p>
        </div>`
        })
        //AJOUT D'ACTION SUR LE BOUTON MOINS
        boutonPlus = document.querySelectorAll(".btnMoins");
        boutonPlus.forEach(element => {
            element.addEventListener("click", qteMoinsPanier);
        });
        //AJOUT D'ACTION SUR LE BOUTON PLUS
        boutonPlus = document.querySelectorAll(".btnPlus");
        boutonPlus.forEach(element => {
            element.addEventListener("click", qtePlusPanier);
        });
        //AJOUT D'ACTION SUR LE BOUTON SUP
        boutonPlus = document.querySelectorAll(".btnSup");
        boutonPlus.forEach(element => {
            element.addEventListener("click", suppressionLignePanier);
        });
        // CALCUL DES SOMMES DE PRODUITS ET DES SOUS-TOTAUX
        let sommeQteProduit = 0;
        let sommeSousTotalProduit = 0
        let discount = 0;
        let totalAPayer = 0
        tabPanier.forEach(element => {
            sommeQteProduit = sommeQteProduit + element.quantiteProduitPanier
            sommeSousTotalProduit = sommeSousTotalProduit + element.sousTotalProduitPanier
        })
        // APPLICATION OU NON DE LA PROMO DE 5%
        if (sommeSousTotalProduit >= 1000) {
            discount = (sommeSousTotalProduit / 100) * percent;
            discount = `${Number(discount).toFixed(2)}€`;
            totalAPayer = sommeSousTotalProduit - Number(discount.slice(0, -1));
        } else {
            discount = `Encore ${1000-sommeSousTotalProduit}€ pour bénéficier des ${percent}%`;
            totalAPayer = sommeSousTotalProduit
        }
        document.getElementById("divDroiteRecapCommande").innerHTML += `<div>
            <p>${sommeQteProduit}</p>
            <p>${sommeSousTotalProduit}€</p>
            <p>${discount}</p>
            <p>${totalAPayer}€</p>
            </div>`
    }
}
recupStorage()

//------------------------------------------------------//
//                  AJOUT DE PRODUIT                    //
//------------------------------------------------------//

//FONCTION D'AJOUT AU PANIER
function qtePlusPanier(clickBoutonAjoutPanier) {
    //VIDAGE DU LOCALSTORAGE
    localStorage.clear();
    // VIDAGE DE L'AFFICHAGE HTML
    document.getElementById("listeProduitsPanier").innerHTML = "";
    document.getElementById("divDroiteRecapCommande").innerHTML = "";
    //RECUPERATION DE L'ID DU BOUTON CLIQUE QUI CORRESPOND A L'ID DU PRODUIT DANS LE FICHIER JSON
    produitSelectionne = (clickBoutonAjoutPanier.target.value);
    //SI LE PANIER EST VIDE
    if (tabPanier.length == 0) {
        ajout(produitSelectionne)
    }
    //SINON SI LE PANIER N'EST PAS VIDE
    else {
        let presentPanier = false
        //VERIFICATION DE LA PRESENCE DE L'ARTICLE DANS LE PANIER POUR EVITER DE DOUBLER LES LIGNES
        //ON INCREMENTE LA QUANTITE ET LE SOUS-TOTAL
        tabPanier.forEach(element => {
            if (element.idProduitPanier == produitSelectionne) {
                element.quantiteProduitPanier++
                element.sousTotalProduitPanier = element.quantiteProduitPanier * element.prixProduitPanier
                presentPanier = true;
            }
        })
        //SI PRODUIT ABSENT DU PANIER LA VARIABLE presentPanier RESTE A FALSE ET ON AJOUTE LE PRODUIT NORMAL
        if (presentPanier == false) {
            ajout(produitSelectionne)
        }
    }
    //ENVOI DU PANIER VERS LE LOCAL STORAGE
    localStorage.setItem(`storagePanier`, JSON.stringify(tabPanier));
    let recupStoragePanier = localStorage.getItem(`storagePanier`);
    tabPanier = JSON.parse(recupStoragePanier);
    recupStorage();
}

//FONCTION QUI SERA APPELER DEPUIS LA FONCTION "qtePlusPanier" SI LE PANIER EST VIDE
function ajout(valueBouton) {
    affichageMagasin.forEach(element => {
        if (element.idProduit == valueBouton) {
            tabPanier.push({
                idProduitPanier: element.idProduit,
                imgProduitPanier: element.imageProduit,
                nomProduitPanier: element.nomProduit,
                prixProduitPanier: element.prixProduit,
                quantiteProduitPanier: 1,
                sousTotalProduitPanier: element.prixProduit
            });
        }
    })
}


//------------------------------------------------------//
//               SUPPRESSION DE PRODUIT                 //
//------------------------------------------------------//

//FONCTION DE RETRAIT D'UNE QUANTITE D'UN PRODUIT DU PANIER
function qteMoinsPanier(clickBoutonAjoutPanier) {
    //VIDAGE DU LOCALSTORAGE
    localStorage.clear();
    // VIDAGE DE L'AFFICHAGE HTML
    document.getElementById("listeProduitsPanier").innerHTML = "";
    document.getElementById("divDroiteRecapCommande").innerHTML = "";
    //RECUPERATION DE L'ID DU BOUTON CLIQUE QUI CORRESPOND A L'ID DU PRODUIT DANS LE FICHIER JSON
    produitSelectionne = (clickBoutonAjoutPanier.target.value);
    tabPanier.forEach(element => {
        if (element.idProduitPanier == produitSelectionne) {
            if (element.quantiteProduitPanier == 1) {
                suppresion(produitSelectionne)
            } else {
                element.quantiteProduitPanier--
                element.sousTotalProduitPanier = element.quantiteProduitPanier * element.prixProduitPanier
            }
        }
    })
    //ENVOI DU PANIER VERS LE LOCAL STORAGE
    localStorage.setItem(`storagePanier`, JSON.stringify(tabPanier));
    let recupStoragePanier = localStorage.getItem(`storagePanier`);
    tabPanier = JSON.parse(recupStoragePanier);
    recupStorage();
}

// FONCTION DE SUPPRESSION DE LIGNE DU PANIER
function suppressionLignePanier(clickBoutonAjoutPanier) {
    //VIDAGE DU LOCALSTORAGE
    localStorage.clear();
    // VIDAGE DE L'AFFICHAGE HTML
    document.getElementById("listeProduitsPanier").innerHTML = "";
    document.getElementById("divDroiteRecapCommande").innerHTML = "";
    //RECUPERATION DE L'ID DU BOUTON CLIQUE QUI CORRESPOND A L'ID DU PRODUIT DANS LE FICHIER JSON
    produitSelectionne = (clickBoutonAjoutPanier.target.value);
    tabPanier.forEach(element => {
        if (element.idProduitPanier == produitSelectionne) {
            suppresion(produitSelectionne)
        }
    })
    //ENVOI DU PANIER VERS LE LOCAL STORAGE
    localStorage.setItem(`storagePanier`, JSON.stringify(tabPanier));
    let recupStoragePanier = localStorage.getItem(`storagePanier`);
    tabPanier = JSON.parse(recupStoragePanier);
    recupStorage();
}

// FONCTION QUI SERA APPELER PAR LES FONCTIONS "qteMoinsPanier" ET "suppressionLignePanier" 
// POUR SUPPRIMER UN PRODUIT ET SA QUANTITE TOTALE DU PANIER
function suppresion(valueBouton) {
    //JE LANCE UNE ALERTE POUR SAVOIR SI L'UTILISATEUR VEUT SUPPRIMER L'ARTICLE DU PANIER
    let reponse = window.confirm("Supprimer l'article du panier?")
    if (reponse) {
        console.log(valueBouton);
        tabPanier.forEach(element => {
            if (element.idProduitPanier == valueBouton) {
                console.log(tabPanier.indexOf(element));
                tabPanier.splice(tabPanier.indexOf(element), 1);
                console.log(tabPanier);
            }
        })
    }
}