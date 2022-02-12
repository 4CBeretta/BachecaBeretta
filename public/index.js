import { initializeApp } from "firebase/app";
import { getDatabase, ref as refDb, onValue, get as getDb, child, query, orderByChild, orderByKey, equalTo, update, set as setDb, limitToLast, remove} from "firebase/database";
import { getStorage, getDownloadURL, ref as refFirestore } from "firebase/storage";
import { getAuth, signInWithRedirect, signOut, signInWithCredential, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6phhozIMp1sfTgD7bO7wVjgNZ56sM2XU",
  authDomain: "bachecaberetta-e8a68.firebaseapp.com",
  projectId: "bachecaberetta-e8a68",
  storageBucket: "bachecaberetta-e8a68.appspot.com",
  messagingSenderId: "977681916390",
  appId: "1:977681916390:web:fe020736c2d1d5e6c1f627",
  databaseURL: "https://bachecaberetta-e8a68-default-rtdb.europe-west1.firebasedatabase.app/"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
const provider = new GoogleAuthProvider();
auth.languageCode = 'it';

var userData = {
  id: null, mail: null, insta: null, telefono: null, telegram: null, nome: null, cognome: null
  //, classe: null, istituto: null
}

// AUTH STATE CHANGE LISTENER *******************************************************
function myAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && userData.id === user.uid) {
    return;
  }

  if (user) { // A USER IS SIGNED IN
    /*userData.id = user.uid;
    userData.mail = user.email;

    getDb(child(refDb(database), "users/" + user.uid)).then((snapshot) => {
      if (snapshot.exists()) {
        fillUserData(snapshot.val());
      } else {
        window.alert("Non è stato possibile recuperare le informazioni dell'utente dal database, l'utente esiste ma i sui dati non sono nel database!");
      }
    }).catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("ERROR AUTHSTATECHANGE: " + errorMessage + ", code: " + errorCode);
    });*/
  } else { // NO USER IS SIGNED IN
    deleteUserData();

    onLoggedOut();
  }
}
// *****************************************************************************

// GOOGLE REDIRECT LOGIN HANDLER **************************************************
getRedirectResult(auth)
  .then((result) => {
    //const credential = GoogleAuthProvider.credentialFromResult(result);
    //const token = credential.accessToken;
    var userMailSplitDot = result.user.email.split('.');
    var userMailSplitAt = result.user.email.split('@');

    if(userMailSplitAt[userMailSplitAt.length - 1] !== 'istitutoberetta.edu.it') {
      window.alert("Ci si può registrare solo con gli account istituzionali (\'istitutoberetta.edu.it\')");
      return;
    }

    const user = result.user;
    userData.id = user.uid;
    userData.mail = user.email;
    userData.nome = userMailSplitDot[0];
    userData.cognome = userMailSplitDot[1].split('@')[0];

    getDb(refDb(database, 'users/' + user.uid)).then((snap) => {
      if (snap.exists()) {
        userData.id = snap.key;
        fillUserData(snap.val());
        onLoggedIn();
        document.getElementById("logoutbtnNav").hidden = false;
      } else {
        // go to create the account
        document.getElementById('loginbtnNav').hidden = true;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookSellAdSection").hidden = true;
        document.getElementById("bookBuyAdSection").hidden = true;
        document.getElementById("repSellAdSection").hidden = true;
        document.getElementById("repBuyAdSection").hidden = true;
        document.getElementById("createAccountSection").hidden = false;
        window.location.href = window.location.href.split('#')[0] + "#createAccountSection";
      }
    });
    
    document.getElementById("logincreateSection").hidden = true;
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    //const email = error.email;
    //const credential = GoogleAuthProvider.credentialFromError(error);

    if(errorCode !== undefined)
      window.alert("ERRORE REDIRECT: " + errorMessage + ", code: " + errorCode);
  });
// ****************************************************************************

function onLoggedIn() {
  document.getElementById("logoutbtnNav").hidden = false;
  document.getElementById("logincreateSection").hidden = true;
  document.getElementById("createAccountSection").hidden = true;
  document.getElementById("contentAnnunci").hidden = false;
  document.getElementById("contentCrea").hidden = false;
  document.getElementById("navbtn1").hidden = false;
  document.getElementById("navbtn2").hidden = false;
  document.getElementById("navbtn3").hidden = false;
  document.getElementById("navbtn4").hidden = false;
  document.getElementById('loginbtnNav').hidden = true;
  document.getElementById("homebtnNav").hidden = true;
  document.getElementById("profiloSection").hidden = true;
  document.getElementById("profilobtnNav").hidden = false;
  //document.getElementById("services").hidden = false;
  document.getElementById("bookSellAdSection").hidden = true;
  document.getElementById("bookBuyAdSection").hidden = true;
  document.getElementById("repSellAdSection").hidden = true;
  document.getElementById("repBuyAdSection").hidden = true;
}

function onLoggedOut() {
  document.getElementById("logoutbtnNav").hidden = true;
  document.getElementById("logincreateSection").hidden = true;
  document.getElementById("createAccountSection").hidden = true;
  document.getElementById("contentAnnunci").hidden = false;
  document.getElementById("contentCrea").hidden = false;
  document.getElementById("navbtn1").hidden = false;
  document.getElementById("navbtn2").hidden = false;
  document.getElementById("navbtn3").hidden = false;
  document.getElementById("navbtn4").hidden = false;
  document.getElementById('loginbtnNav').hidden = false;
  document.getElementById("homebtnNav").hidden = true;
  document.getElementById("profiloSection").hidden = true;
  document.getElementById("profilobtnNav").hidden = true;
  document.getElementById("bookSellAdSection").hidden = true;
  document.getElementById("bookBuyAdSection").hidden = true;
  document.getElementById("repSellAdSection").hidden = true;
  document.getElementById("repBuyAdSection").hidden = true;
}


// ADS SECTIONS
function fillBookSellAdSection(data, venditore) {
  document.getElementById("bookSellAdSectionTitolo").innerHTML = data.ad.titolo;
  document.getElementById("bookSellAdSectionMateria").innerHTML = data.ad.materia;
  document.getElementById("bookSellAdSectionAnno").innerHTML = data.ad.anno;
  document.getElementById("bookSellAdSectionEdizione").innerHTML = data.ad.annoEdizione;
  document.getElementById("bookSellAdSectionPrezzo").innerHTML = data.ad.prezzo + "€";
  document.getElementById("bookSellAdSectionContrattabile").hidden = !data.ad.contrattabile;
  //document.getElementById("bookSellAdSectionContrattabile").innerHTML = (data.ad.contrattabile ? "Si" : "No");
  document.getElementById("bookSellAdSectionISBN").innerHTML = data.ad.isbn;
  document.getElementById("bookSellAdSectionData").innerHTML = data.ad.date;
  document.getElementById("bookSellAdSectionVenditore").innerHTML = venditore.nome + " " + venditore.cognome;
  document.getElementById("bookSellAdSectionContatti").innerHTML = "Mail: " + venditore.mail;
  if(venditore.insta !== null)
    document.getElementById("bookSellAdSectionContatti").innerHTML += "\nInstagram: " + venditore.insta;
  if(venditore.telefono !== null)
    document.getElementById("bookSellAdSectionContatti").innerHTML += "\nTelefono: " + venditore.telefono;
  if(venditore.telegram !== null)
    document.getElementById("bookSellAdSectionContatti").innerHTML += "\nTelegram: " + venditore.telegram;
}
function fillBookBuyAdSection(data, acquirente) {
  document.getElementById("bookBuyAdSectionTitolo").innerHTML = data.ad.titolo;
  document.getElementById("bookBuyAdSectionMateria").innerHTML = data.ad.materia;
  document.getElementById("bookBuyAdSectionAnno").innerHTML = data.ad.anno;
  document.getElementById("bookBuyAdSectionEdizione").innerHTML = data.ad.annoEdizione;
  document.getElementById("bookBuyAdSectionISBN").innerHTML = data.ad.isbn;
  document.getElementById("bookBuyAdSectionData").innerHTML = data.ad.date;
  document.getElementById("bookBuyAdSectionAcquirente").innerHTML = acquirente.nome + " " + acquirente.cognome;
  document.getElementById("bookBuyAdSectionContatti").innerHTML = "Mail: " + acquirente.mail;
  if(acquirente.insta !== null)
    document.getElementById("bookBuyAdSectionContatti").innerHTML += "\nInstagram: " + acquirente.insta;
  if(acquirente.telefono !== null)
    document.getElementById("bookBuyAdSectionContatti").innerHTML += "\nTelefono: " + acquirente.telefono;
  if(acquirente.telegram !== null)
    document.getElementById("bookBuyAdSectionContatti").innerHTML += "\nTelegram: " + acquirente.telegram;
}
function fillRepSellAdSection(data, venditore) {
  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  document.getElementById("repSellAdSectionMateria").innerHTML = subs[0];
  for(let i = 1; i < subsCount; i++) {
    document.getElementById("repSellAdSectionMateria").innerHTML += " - " + subs[i];
  }
  document.getElementById("repSellAdSectionClasse").innerHTML = data.ad.classe;
  document.getElementById("repSellAdSectionDescrizione").innerHTML = data.ad.descrizione;
  document.getElementById("repSellAdSectionIstituto").innerHTML = data.ad.istituto;
  document.getElementById("repSellAdSectionPrezzo").innerHTML = data.ad.prezzo + "€";
  document.getElementById("repSellAdSectionContrattabile").hidden = !data.ad.contrattabile;
  document.getElementById("repSellAdSectionData").innerHTML = data.ad.date;
  document.getElementById("repSellAdSectionVenditore").innerHTML = venditore.nome + " " + venditore.cognome;
  document.getElementById("repSellAdSectionContatti").innerHTML = "Mail: " + venditore.mail;
  if(venditore.insta !== null)
    document.getElementById("repSellAdSectionContatti").innerHTML += "\nInstagram: " + venditore.insta;
  if(venditore.telefono !== null)
    document.getElementById("repSellAdSectionContatti").innerHTML += "\nTelefono: " + venditore.telefono;
  if(venditore.telegram !== null)
    document.getElementById("repSellAdSectionContatti").innerHTML += "\nTelegram: " + venditore.telegram;
}
function fillRepBuyAdSection(data, acquirente) {
  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  document.getElementById("repBuyAdSectionMateria").innerHTML = subs[0];
  for(let i = 1; i < subsCount; i++){
    document.getElementById("repBuyAdSectionMateria").innerHTML += " - " + subs[i];
  }
  document.getElementById("repBuyAdSectionArgomento").innerHTML = data.ad.argomento;
  document.getElementById("repBuyAdSectionAcquirente").innerHTML = acquirente.nome + " " + acquirente.cognome;
  document.getElementById("repSellAdSectionData").innerHTML = data.ad.date;
  document.getElementById("repBuyAdSectionContatti").innerHTML = "Mail: " + acquirente.mail;
  if(acquirente.insta !== null)
    document.getElementById("repBuyAdSectionContatti").innerHTML += "\nInstagram: " + acquirente.insta;
  if(acquirente.telefono !== null)
    document.getElementById("repBuyAdSectionContatti").innerHTML += "\nTelefono: " + acquirente.telefono;
  if(acquirente.telegram !== null)
    document.getElementById("repBuyAdSectionContatti").innerHTML += "\nTelegram: " + acquirente.telegram;
}

function fillBookSellAdSectionUser(data) {
  document.getElementById("bookSellUserAdSectionTitolo").value = data.ad.titolo;
  document.getElementById("bookSellUserAdSectionMateria").value = data.ad.materia;
  document.getElementById("bookSellUserAdSectionAnno").value = "" + data.ad.anno;
  document.getElementById("bookSellUserAdSectionEdizione").value = data.ad.annoEdizione;
  document.getElementById("bookSellUserAdSectionPrezzo").value = data.ad.prezzo + "€";
  document.getElementById("bookSellUserAdSectionContrattabile").value = data.ad.contrattabile;
  document.getElementById("bookSellUserAdSectionISBN").value = data.ad.isbn;
  document.getElementById("bookSellUserAdSectionVenditore").value = userData.nome + " " + userData.cognome;
}
function fillBookBuyAdSectionUser(data) {
  document.getElementById("bookBuyUserAdSectionTitolo").value = data.ad.titolo;
  document.getElementById("bookBuyUserAdSectionMateria").value = data.ad.materia;
  document.getElementById("bookBuyUserAdSectionAnno").value = data.ad.anno;
  document.getElementById("bookBuyUserAdSectionEdizione").value = data.ad.annoEdizione;
  document.getElementById("bookBuyUserAdSectionISBN").value = data.ad.isbn;
  document.getElementById("bookBuyUserAdSectionAcquirente").value = userData.nome + " " + userData.cognome;
}
function fillRepSellAdSectionUser(data) {
  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  document.getElementById("repSellUserAdSectionMateria").value = subs[0];
  for(let i = 1; i < subsCount; i++){
    document.getElementById("repSellUserAdSectionMateria").value += " - " + subs[i];
  }

  document.getElementById("repSellUserAdSectionClasse").value = data.ad.classe;
  document.getElementById("repSellUserAdSectionDescrizione").value = data.ad.descrizione;
  document.getElementById("repSellUserAdSectionIstituto").value = data.ad.istituto;
  document.getElementById("repSellUserAdSectionPrezzo").value = data.ad.prezzo;
  document.getElementById("repSellUserAdSectionContrattabile").value = data.ad.contrattabile;
  document.getElementById("repSellUserAdSectionVenditore").value = userData.nome + " " + userData.cognome;
}
function fillRepBuyAdSectionUser(data) {
  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  document.getElementById("repBuyUserAdSectionMateria").value = subs[0];
  for(let i = 1; i < subsCount; i++){
    document.getElementById("repBuyUserAdSectionMateria").value += " - " + subs[i];
  }
  document.getElementById("repBuyUserAdSectionArgomento").value = data.ad.argomento;
  document.getElementById("repBuyUserAdSectionAcquirente").value = userData.nome + " " + userData.cognome;
}

// CREATE THE VIEW OF A BOOK TO SELL
function getBookSellDiv(data) {
  var code = "<div class=\"col\" id=\"bookSellAd" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">"+
                            "<h4 id=\"heading-card-1\">" + data.ad.titolo + "</h4>"+
                            "<p id=\"cardheader-subtext-1\">" + data.ad.materia + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Anno: " + data.ad.anno + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Edizione: " + data.ad.annoEdizione + "</p>"+
                            "<div>"+
                                "<p id=\"cardheader-subtext-6\">" + data.ad.prezzo + "€&nbsp;&nbsp;" +
                                ((data.ad.contrattabile) ? "<i class=\"fas fa-hands-helping\" title=\"Contrattabile\"></i></p>" : "") +
                            "</div>"+
                            "<p id=\"cardheader-subtext-7\">ISBN: " + data.ad.isbn + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                    "</div>"+
                "</div>"+
              "</div>";

  return code;
}
// CREATE THE VIEW OF A BOOK TO BUY
function getBookBuyDiv(data) {
  var code = "<div class=\"col\" id=\"bookBuyAd" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">"+
                            "<h4 id=\"heading-card-1\">" + data.ad.titolo + "</h4>"+
                            "<p id=\"cardheader-subtext-1\">" + data.ad.materia + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Anno: " + data.ad.anno + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Edizione: " + data.ad.annoEdizione + "</p>"+
                            "<p id=\"cardheader-subtext-7\">ISBN: " + data.ad.isbn + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                    "</div>"+
                "</div>"+
              "</div>";

  return code;
}
// CREATE THE VIEW OF A REP TO SELL
function getRepSellDiv(data) {
  var code = "<div class=\"col\" id=\"repSellAd" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">" +
                            "<h4 id=\"heading-card-1\">" + data.ad.nomeCognome + "</h4>";

  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  if(subsCount === 1)
    code +=                 "<p id=\"cardheader-subtext-1\">Materia: " + subs[0] + "</p>";
  else if (subsCount === 2) 
    code +=                 "<p id=\"cardheader-subtext-1\">Materie: " + subs[0] + " - " + subs[1] + "</p>";
  else if (subsCount > 2) 
    code +=                 "<p id=\"cardheader-subtext-1\">Materie: " + subs[0] + " - " + subs[1] + " & more</p>";
  
  code +=                   "<p id=\"cardheader-subtext-1\">Plesso: " + data.ad.istituto + " - Anno: " + data.ad.classe + "</p>"+
                            "<div>"+
                                "<p id=\"cardheader-subtext-6\">" + data.ad.prezzo + "€&nbsp;&nbsp;" +
                                ((data.ad.contrattabile) ? "<i class=\"fas fa-hands-helping\" title=\"Contrattabile\"></i></p>" : "") +
                            "</div>"+
                            "<p id=\"cardheader-subtext-7\">" + data.ad.descrizione + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                    "</div>"+
                "</div>"+
              "</div>";
  
  return code;
}
// CREATE THE VIEW OF A REP TO BUY
function getRepBuyDiv(data) {
  var code = "<div class=\"col\" id=\"repBuyAd" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">";

  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  if(subsCount === 1)
  code +=                   "<h4 id=\"heading-card-1\">Materia: " + subs[0] + "</h4>";
  else if (subsCount === 2) 
  code +=                   "<h4 id=\"heading-card-1\">Materie: " + subs[0] + " - " + subs[1] + "</h4>";
  else if (subsCount > 2) 
  code +=                   "<h4 id=\"heading-card-1\">Materie: " + subs[0] + " - " + subs[1] + " & more</h4>";

  code +=                   "<p id=\"cardheader-subtext-7\">" + data.ad.argomento + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                    "</div>"+
                "</div>"+
              "</div>";

  return code;
}


// CREATE THE VIEW OF A BOOK TO SELL USER
function getBookSellDivUser(data) {
  var code = "<div class=\"col\" id=\"bookSellAdUser" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">"+
                            "<h4 id=\"heading-card-1\">" + data.ad.titolo + "</h4>"+
                            "<p id=\"cardheader-subtext-1\">" + data.ad.materia + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Anno: " + data.ad.anno + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Edizione: " + data.ad.annoEdizione + "</p>"+
                            "<div>"+
                                "<p id=\"cardheader-subtext-6\">" + data.ad.prezzo + "€&nbsp;&nbsp;" +
                                ((data.ad.contrattabile) ? "<i class=\"fas fa-hands-helping\" title=\"Contrattabile\"></i></p>" : "") +
                            "</div>"+
                            "<p id=\"cardheader-subtext-7\">ISBN: " + data.ad.isbn + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>" +
                        "<button type=\"button\" id=\"bookSellAdUserDelete" + data.id + "\">DELETE</button>"+
                        "<button type=\"button\" id=\"bookSellAdUserModifica" + data.id + "\">MODIFICA</button>"+
                    "</div>"+
                "</div>"+
              "</div>";


  return code;
}
// CREATE THE VIEW OF A BOOK TO BUY USER
function getBookBuyDivUser(data) {
  var code = "<div class=\"col\" id=\"bookBuyAdUser" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">"+
                            "<h4 id=\"heading-card-1\">" + data.ad.titolo + "</h4>"+
                            "<p id=\"cardheader-subtext-1\">" + data.ad.materia + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Anno: " + data.ad.anno + "</p>"+
                            "<p id=\"cardheader-subtext-1\">Edizione: " + data.ad.annoEdizione + "</p>"+
                            "<p id=\"cardheader-subtext-7\">ISBN: " + data.ad.isbn + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                        "<button type=\"button\" id=\"bookBuyAdUserDelete" + data.id + "\">DELETE</button>"+
                        "<button type=\"button\" id=\"bookBuyAdUserModifica" + data.id + "\">MODIFICA</button>"+
                    "</div>"+
                "</div>"+
              "</div>";

  return code;
}
// CREATE THE VIEW OF A REP TO SELL USER
function getRepSellDivUser(data) {
  var code = "<div class=\"col\" id=\"repSellAdUser" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">" +
                            "<h4 id=\"heading-card-1\">" + data.ad.nomeCognome + "</h4>";

  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  if(subsCount === 1)
    code +=                 "<p id=\"cardheader-subtext-1\">Materia: " + subs[0] + "</p>";
  else if (subsCount === 2) 
    code +=                 "<p id=\"cardheader-subtext-1\">Materie: " + subs[0] + " - " + subs[1] + "</p>";
  else if (subsCount > 2) 
    code +=                 "<p id=\"cardheader-subtext-1\">Materie: " + subs[0] + " - " + subs[1] + " & more</p>";
  
  code +=                   "<p id=\"cardheader-subtext-1\">Plesso: " + data.ad.istituto + " - Anno: " + data.ad.classe + "</p>"+
                            "<div>"+
                                "<p id=\"cardheader-subtext-6\">" + data.ad.prezzo + "€&nbsp;&nbsp;" +
                                ((data.ad.contrattabile) ? "<i class=\"fas fa-hands-helping\" title=\"Contrattabile\"></i></p>" : "") +
                            "</div>"+
                            "<p id=\"cardheader-subtext-7\">" + data.ad.descrizione + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                        "<button type=\"button\" id=\"repSellAdUserDelete" + data.id + "\">DELETE</button>"+
                        "<button type=\"button\" id=\"repSellAdUserModifica" + data.id + "\">MODIFICA</button>"+
                    "</div>"+
                "</div>"+
              "</div>";

  return code;
}
// CREATE THE VIEW OF A REP TO BUY USER
function getRepBuyDivUser(data) {
  var code = "<div class=\"col\" id=\"repBuyAdUser" + data.id + "\">"+
                "<div class=\"card cards-shadown cards-hover\" data-aos=\"flip-left\" data-aos-duration=\"950\">"+
                    "<div class=\"card-header\" style=\"background: rgb(218,163,3);min-height: 280px;\"><span class=\"space\"></span>"+
                        "<div class=\"cardheader-text\">";

  var subs = Object.keys(data.ad.subs);
  var subsCount = subs.length;
  if(subsCount === 1)
  code +=                   "<h4 id=\"heading-card-1\">Materia: " + subs[0] + "</h4>";
  else if (subsCount === 2) 
  code +=                   "<h4 id=\"heading-card-1\">Materie: " + subs[0] + " - " + subs[1] + "</h4>";
  else if (subsCount > 2) 
  code +=                   "<h4 id=\"heading-card-1\">Materie: " + subs[0] + " - " + subs[1] + " & more</h4>";

  code +=                   "<p id=\"cardheader-subtext-7\">" + data.ad.argomento + "</p>"+
                        "</div>"+
                    "</div>"+
                    "<div class=\"card-body\">"+
                        "<p class=\"card-text sub-text-color\">" + data.ad.date + "</p>"+
                        "<button type=\"button\" id=\"repBuyAdUserDelete" + data.id + "\">DELETE</button>"+
                        "<button type=\"button\" id=\"repBuyAdUserModifica" + data.id + "\">MODIFICA</button>"+
                    "</div>"+
                "</div>"+
              "</div>";

  return code;
}

function downloadUserAds() {
  var userAdsContainer = document.getElementById("profiloAnnunciContainer");
  var userAdsCount = 0;
  var ind = -1;

  getDb(query(refDb(database, 'venditalibro'), orderByChild('venditore'), equalTo(userData.id))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    for (let val in ads) {
      var ad = ads[val];

      if (userAdsCount % 3 === 0) { // new row
        ind++;
        userAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"userAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("userAdsContainerRow" + ind).innerHTML += getBookSellDivUser(ad);

      var cardDelete = document.getElementById("bookSellAdUserDelete" + ad.id);
      var cardModifica = document.getElementById("bookSellAdUserModifica" + ad.id);
      var deleteCount = 0
      cardDelete.addEventListener('click', function() {
        if (deleteCount === 0) {
          deleteCount++;
          cardDelete.value = "SICURO?";
        }
        else {
          remove(refDb(database, 'venditalibro/' + ad.id));
          location.reload();
        }
      });
      cardModifica.addEventListener('click', function() {
        document.getElementById("bookSellAdSectionUser").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookBuyAdSectionUser").hidden = true;
        document.getElementById("repSellAdSectionUser").hidden = true;
        document.getElementById("repBuyAdSectionUser").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        fillBookSellAdSectionUser(data);
      });

      userAdsCount++;
    }
  });

  // DOWNLOAD ANNUNCI RICHIESTA LIBRI
  getDb(query(refDb(database, 'richiestalibro'), orderByChild('acquirente'), equalTo(userData.id))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (userAdsCount % 3 === 0) { // new row
        ind++;
        userAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"userAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("userAdsContainerRow" + ind).innerHTML += getBookBuyDivUser(ad);

      var cardDelete = document.getElementById("bookBuyAdUserDelete" + ad.id);
      var cardModifica = document.getElementById("bookBuyAdUserModifica" + ad.id);
      var deleteCount = 0
      cardDelete.addEventListener('click', function() {
        if (deleteCount === 0) {
          deleteCount++;
          cardDelete.value = "SICURO?";
        }
        else {
          remove(refDb(database, 'richiestalibro/' + ad.id));
          location.reload();
        }
      });
      cardModifica.addEventListener('click', function() {
        document.getElementById("bookBuyAdSectionUser").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookSellAdSectionUser").hidden = true;
        document.getElementById("repSellAdSectionUser").hidden = true;
        document.getElementById("repBuyAdSectionUser").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        fillBookBuyAdSectionUser(data);
      });

      userAdsCount++;
    }
  });

  // DOWNLOAD ANNUNCI VENDITA LEZIONI
  getDb(query(refDb(database, 'venditalezione'), orderByChild('venditore'), equalTo(userData.id))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (userAdsCount % 3 === 0) { // new row
        ind++;
        userAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"userAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("userAdsContainerRow" + ind).innerHTML += getRepSellDivUser(ad);

      var cardDelete = document.getElementById("repSellAdUserDelete" + ad.id);
      var cardModifica = document.getElementById("repSellAdUserModifica" + ad.id);
      var deleteCount = 0
      cardDelete.addEventListener('click', function() {
        if (deleteCount === 0) {
          deleteCount++;
          cardDelete.value = "SICURO?";
        }
        else {
          remove(refDb(database, 'venditalezione/' + ad.id));
          location.reload();
        }
      });
      cardModifica.addEventListener('click', function() {
        document.getElementById("repSellAdSectionUser").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookSellAdSectionUser").hidden = true;
        document.getElementById("bookBuyAdSectionUser").hidden = true;
        document.getElementById("repBuyAdSectionUser").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        fillRepSellAdSectionUser(data);
      });

      userAdsCount++;
    }
  });

  // DOWNLOAD ANNUNCI RICHIESTA LEZIONI
  getDb(query(refDb(database, 'richiestalezione'), orderByChild('acquirente'), equalTo(userData.id))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (userAdsCount % 3 === 0) { // new row
        ind++;
        userAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"userAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("userAdsContainerRow" + ind).innerHTML += getRepBuyDivUser(ad);

      var cardDelete = document.getElementById("repBuyAdUserDelete" + ad.id);
      var cardModifica = document.getElementById("repBuyAdUserModifica" + ad.id);
      var deleteCount = 0
      cardDelete.addEventListener('click', function() {
        if (deleteCount === 0) {
          deleteCount++;
          cardDelete.value = "SICURO?";
        }
        else {
          remove(refDb(database, 'richiestalezione/' + ad.id));
          location.reload();
        }
      });
      cardModifica.addEventListener('click', function() {
        document.getElementById("repBuyAdSectionUser").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookSellAdSectionUser").hidden = true;
        document.getElementById("bookBuyAdSectionUser").hidden = true;
        document.getElementById("repSellAdSectionUser").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        fillRepBuyAdSectionUser(data);
      });

      userAdsCount++;
    }
  });
}

// USER DATA UTILITY FUNCTIONS ************************************************
function deleteUserData(){
  userData.id = null;
  userData.insta = null;
  userData.mail = null;
  userData.telefono = null;
  userData.telegram = null;
  userData.cognome = null;
  userData.nome = null;
  //userData.istituto = null;
  //userData.classe = null;

  /*document.getElementById("sellBookContatti").hidden = false;
  document.getElementById("buyBookContatti").hidden = false;
  document.getElementById("sellRepContatti").hidden = false;
  document.getElementById("buyRepContatti").hidden = false;*/
  //document.getElementById("sellRepNomeCognome").hidden = false;
}

function fillUserData(data){
  userData.nome = data.nome;
  userData.cognome = data.cognome;
  userData.mail = data.mail;
  
  if (data.insta !== null) {
    userData.insta = data.insta;
  }
  if (data.telefono !== null) {
    userData.telefono = data.telefono;
  }
  if (data.telegram !== null) {
    userData.telegram = data.telegram;
  }
  /*document.getElementById("sellBookContatti").hidden = true;
  document.getElementById("buyBookContatti").hidden = true;
  document.getElementById("sellRepContatti").hidden = true;
  document.getElementById("buyRepContatti").hidden = true;*/
  //document.getElementById("sellRepNomeCognome").hidden = true;

  document.getElementById("profiloNome").innerHTML = userData.nome + " " + userData.cognome;

  /*
  document.getElementById("sellRepNomeCognome").value = data.nome + " " + data.cognome;

  if (data.insta !== null) {
    userData.insta = data.insta;
    document.getElementById("sellBookInsta").value = data.insta;
    document.getElementById("buyBookInsta").value = data.insta;
    document.getElementById("sellRepInsta").value = data.insta;
    document.getElementById("buyRepInsta").value = data.insta;
  }
  if (data.telefono !== null) {
    userData.telefono = data.telefono;
    document.getElementById("sellBookTelefono").value = data.telefono;
    document.getElementById("buyBookTelefono").value = data.telefono;
    document.getElementById("sellRepTelefono").value = data.telefono;
    document.getElementById("buyRepTelefono").value = data.telefono;
  }
  if (data.telegram !== null) {
    userData.telegram = data.telegram;
    document.getElementById("sellBookTelegram").value = data.telegram;
    document.getElementById("buyBookTelegram").value = data.telegram;
    document.getElementById("sellRepTelegram").value = data.telegram;
    document.getElementById("buyRepTelegram").value = data.telegram;
  }
  */

  //userData.classe = data.classe;
  //userData.istituto = data.istituto;
}
// ************************************************************************

function createUUID(){
  var uuid = "";
  for (let i = 0; i < 4; i++) {
    //                  0 <= x < 1       0 <= x < 0x10000 means that the number can be represented with no more than 4 exadecimal digits
    uuid += Math.floor((Math.random()) * 0x10000).toString(16); // number turned to a string of its exa representation
  }

  return uuid;
}

// ONLOAD ********************************************
window.addEventListener('load', function() {
  var sellBookAnnoEdizioneField = document.getElementById('sellBookAnnoEdizione');
  sellBookAnnoEdizioneField.max = new Date().getFullYear();

  // SIGN OUT BUTTON
  var logoutButtonNav = document.getElementById('logoutbtnNav');
  logoutButtonNav.addEventListener('click', function() {
    signOut(auth).then(() => {
      deleteUserData();

      onLoggedOut();
    }).catch((error) => {
      const errorMessage = error.message;
      const errorCode = error.code;
      window.alert("ERRORE SIGNOUT: " + errorMessage + ", code: " + errorCode);
    });
  });


  // NAV BAR BUTTONS
  var loginButtonNav = document.getElementById('loginbtnNav');
  var homeBtnNav = document.getElementById("homebtnNav");
  loginButtonNav.addEventListener('click', function() {
    //signInWithRedirect(auth, provider);

    homeBtnNav.hidden = false;
    loginButtonNav.hidden = true;
    document.getElementById("logincreateSection").hidden = false;
    document.getElementById("contentAnnunci").hidden = true;
    document.getElementById("contentCrea").hidden = true;
    document.getElementById("navbtn1").hidden = true;
    document.getElementById("navbtn2").hidden = true;
    document.getElementById("navbtn3").hidden = true;
    document.getElementById("navbtn4").hidden = true;
    document.getElementById("bookSellAdSection").hidden = true;
    document.getElementById("bookBuyAdSection").hidden = true;
    document.getElementById("repSellAdSection").hidden = true;
    document.getElementById("repBuyAdSection").hidden = true;
    //document.getElementById("services").hidden = true;
  });
  var bachecaBerettaBtnNav = document.getElementById('navbtn0');
  bachecaBerettaBtnNav.addEventListener('click', function() {
    if (userData.id === null) {
      loginButtonNav.hidden = false;
      document.getElementById("profilobtnNav").hidden = true;
      document.getElementById("contentCrea").hidden = true;
    }
    else {
      loginButtonNav.hidden = true;
      document.getElementById("profilobtnNav").hidden = false;
      document.getElementById("contentCrea").hidden = false;
    }
    homeBtnNav.hidden = true;
    document.getElementById("logincreateSection").hidden = true;
    document.getElementById("createAccountSection").hidden = true;
    document.getElementById("contentAnnunci").hidden = false;
    document.getElementById("navbtn1").hidden = false;
    document.getElementById("navbtn2").hidden = false;
    document.getElementById("navbtn3").hidden = false;
    document.getElementById("navbtn4").hidden = false;
    document.getElementById("profiloSection").hidden = true;
    document.getElementById("bookSellAdSection").hidden = true;
    document.getElementById("bookBuyAdSection").hidden = true;
    document.getElementById("repSellAdSection").hidden = true;
    document.getElementById("repBuyAdSection").hidden = true;
    //document.getElementById("services").hidden = false;
  });
  homeBtnNav.addEventListener('click', function() {
    if (userData.id === null) {
      loginButtonNav.hidden = false;
      document.getElementById("profilobtnNav").hidden = true;
      document.getElementById("contentCrea").hidden = true;
    }
    else {
      loginButtonNav.hidden = true;
      document.getElementById("profilobtnNav").hidden = false;
      document.getElementById("contentCrea").hidden = false;
    }
    homeBtnNav.hidden = true;
    document.getElementById("logincreateSection").hidden = true;
    document.getElementById("createAccountSection").hidden = true;
    document.getElementById("contentAnnunci").hidden = false;
    document.getElementById("navbtn1").hidden = false;
    document.getElementById("navbtn2").hidden = false;
    document.getElementById("navbtn3").hidden = false;
    document.getElementById("navbtn4").hidden = false;
    document.getElementById("profiloSection").hidden = true;
    document.getElementById("bookSellAdSection").hidden = true;
    document.getElementById("bookBuyAdSection").hidden = true;
    document.getElementById("repSellAdSection").hidden = true;
    document.getElementById("repBuyAdSection").hidden = true;
    //document.getElementById("services").hidden = false;
  });
  var profiloBtnNav = document.getElementById("profilobtnNav");
  profiloBtnNav.addEventListener('click', function() {
    homeBtnNav.hidden = false;
    loginButtonNav.hidden = true;
    document.getElementById("logincreateSection").hidden = true;
    document.getElementById("createAccountSection").hidden = true;
    document.getElementById("contentAnnunci").hidden = true;
    document.getElementById("contentCrea").hidden = false;
    document.getElementById("navbtn1").hidden = true;
    document.getElementById("navbtn2").hidden = true;
    document.getElementById("navbtn3").hidden = true;
    document.getElementById("navbtn4").hidden = true;
    document.getElementById("profilobtnNav").hidden = true;
    document.getElementById("profiloSection").hidden = false;
    document.getElementById("bookSellAdSection").hidden = true;
    document.getElementById("bookBuyAdSection").hidden = true;
    document.getElementById("repSellAdSection").hidden = true;
    document.getElementById("repBuyAdSection").hidden = true;
    //document.getElementById("services").hidden = false;

    // download user ads;
    downloadUserAds();
  });

  var buyBookButton = document.getElementById("buyBookButton");
  buyBookButton.addEventListener('click', function() {
    if(userData.id !== null)
      window.location.href = window.location.href.split('#')[0] + "#bookBuySection";
    else {
      window.alert("Per creare annunci è necessario avere un account!");
      signInWithRedirect(auth, provider);
    }
  });
  var sellBookButton = document.getElementById("sellBookButton");
  sellBookButton.addEventListener('click', function() {
    if(userData.id !== null)
      window.location.href = window.location.href.split('#')[0] + "#bookSellSection";
    else {
      window.alert("Per creare annunci è necessario avere un account!");
      signInWithRedirect(auth, provider);
    }
  });
  var buyRepButton = document.getElementById("buyRepButton");
  buyRepButton.addEventListener('click', function() {
    if(userData.id !== null)
      window.location.href = window.location.href.split('#')[0] + "#repBuySection";
    else {
      window.alert("Per creare annunci è necessario avere un account!");
      signInWithRedirect(auth, provider);
    }
  });
  var sellRepButton = document.getElementById("sellRepButton");
  sellRepButton.addEventListener('click', function() {
    if(userData.id !== null)
      window.location.href = window.location.href.split('#')[0] + "#repSellSection";
    else {
      window.alert("Per creare annunci è necessario avere un account!");
      signInWithRedirect(auth, provider);
    }
  });

  // PROFILO BUTTONS
  /*var profiloCreaBtn = document.getElementById("profiloCrea");
  profiloCreaBtn.addEventListener('click', function() {
    loginButtonNav.hidden = true;
    homeBtnNav.hidden = true;
    document.getElementById("logincreateSection").hidden = true;
    document.getElementById("contentAnnunci").hidden = false;
    document.getElementById("contentCrea").hidden = true;
    document.getElementById("navbtn1").hidden = false;
    document.getElementById("navbtn2").hidden = false;
    document.getElementById("navbtn3").hidden = false;
    document.getElementById("navbtn4").hidden = false;
    document.getElementById("profilobtnNav").hidden = false;
    document.getElementById("profiloSection").hidden = true;
    //document.getElementById("services").hidden = false;
  });*/

  // SIGN IN WITH GOOGLE BUTTON
  var signInGoogleButton = document.getElementById('googleloginbtn');
  signInGoogleButton.addEventListener('click', function() {
    signInWithRedirect(auth, provider);
  });
  
  // AGGIUNGI MATERIA BUTTON IN SELL/BUY REPS
  var currSellRepSubsNum = 1;
  var sellRepAddSubButton = document.getElementById('sellRepAddSub');
  sellRepAddSubButton.addEventListener('click', function() {
    var sellRepSubsDiv = document.getElementById('sellRepSubs');
    currSellRepSubsNum++;
    var newInput = "<div class=\"col-md-10 offset-md-1\"><input id=\"sellRepSub" + currSellRepSubsNum + "\" class=\"form-control\" type=\"text\" style=\"margin-left:0px;font-family:Roboto, sans-serif;\" name=\"materia\"></div>";
    sellRepSubsDiv.innerHTML += newInput;
  });

  var currBuyRepSubsNum = 1;
  var buyRepAddSubButton = document.getElementById('buyRepAddSub');
  buyRepAddSubButton.addEventListener('click', function() {
    var buyRepSubsDiv = document.getElementById('buyRepSubs');
    currBuyRepSubsNum++;
    var newInput = "<div class=\"col-md-10 offset-md-1\"><input id=\"buyRepSub" + currBuyRepSubsNum + "\" class=\"form-control\" type=\"text\" style=\"margin-left:0px;font-family:Roboto, sans-serif;\" name=\"materia\"></div>";
    buyRepSubsDiv.innerHTML += newInput;
  });


  // AUTH STATE CHANGES
  firebase.auth().onAuthStateChanged(myAuthStateChanged);

  // LOGIN FORM
  /*var loginForm = document.getElementById('loginForm');
  loginForm.onsubmit = function(e) {
     e.preventDefault();
     var email = "" + document.getElementById("emailLogin").value;
     var password = "" + document.getElementById("pwLogin").value;

     signInWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       // Signed in
        const user = userCredential.user;
        userData.id = user.uid;
        userData.mail = user.email;

        getDb(child(refDb(database), "users/" + user.uid)).then((snapshot) => {
          if (snapshot.exists()) {
            fillUserData(snapshot.val());
          } else {
            window.alert("Non è stato possibile recuperare le informazioni dell'utente dal database, l'utente esiste ma i sui dati non sono nel database!");
          }
        }).catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          window.alert("ERROR SIGNIN 2: "+ errorMessage + ", code: " + errorCode);
        });

        // ...
        document.getElementById("pwLogin").value = null;
        document.getElementById("emailLogin").value = null;

        onLoggedIn();
     })
     .catch((error) => {
       const errorCode = error.code;
       const errorMessage = error.message;
       deleteUserData();

       window.alert("ERRORE SIGNIN 1: " + errorMessage + ", code: " + errorCode);
     });
  };*/

  // CREATE USER FORM
  var createForm = document.getElementById('createForm');
  createForm.onsubmit = function(e) {
    e.preventDefault();
    document.getElementById("logincreateSection").hidden = true;
    document.getElementById("createAccountSection").hidden = true;
    //document.getElementById("createSection").hidden = true;
    document.getElementById("logoutbtnNav").hidden = false;
    //document.getElementById("services").hidden = false;

    var insta = "" + document.getElementById("instaCreate").value;
    var telefono = "" + document.getElementById("telefonoCreate").value;
    var telegram = "" + document.getElementById("telegramCreate").value;
    //var classe = document.getElementById("classeCreate").value;
    //var istituto = "" + document.getElementById("istitutoCreate").value;

    var data = {
      nome: userData.nome,
      cognome: userData.cognome,
      mail: userData.mail
    }

    if (insta.length !== 0) {
      data.insta = insta;
      userData.insta = insta;
    }
    if (telefono.length !== 0) {
      data.telefono = telefono;
      userData.telefono = telefono;
    }
    if (telegram.length !== 0) {
      data.telegram = telegram;
      userData.telegram = telegram;
    }

    setDb(refDb(database, 'users/' + userData.id), data);

    document.getElementById("logoutbtnNav").hidden = false;
    
    onLoggedIn();
    window.location.href = window.location.href.split('#')[0] + "#";
  };


  // SELL BOOK FORM
  var bookSellForm = document.getElementById('bookSellForm');
  bookSellForm.onsubmit = function(e) {
    e.preventDefault();
    var date = new Date();

    var titoloField = document.getElementById("sellBookTitolo");
    var materiaField = document.getElementById("sellBookMateria");
    var isbnField = document.getElementById("sellBookISBN");
    var prezzoField = document.getElementById("sellBookPrezzo");
    var contrattabileField = document.getElementById("sellBookContrattabile");
    var annoField = document.getElementById("sellBookAnno");
    var annoEdizioneField = document.getElementById("sellBookAnnoEdizione");

    var titolo = titoloField.value;
    var materia = materiaField.value;
    var isbn = isbnField.value;
    var prezzo = prezzoField.value;
    var contrattabile = contrattabileField.value;
    var anno = annoField.value;
    var annoEdizione = Math.max(0, Math.min(date.getYear(), parseInt(annoEdizioneField.value)));

    if (("" +isbn).length !== 13) {
      window.alert("L'ISBN deve essere di 13 cifre");
      return false;
    }

    var data = {
      isbn: isbn,
      contrattabile: contrattabile,
      materia: materia,
      prezzo: prezzo,
      titolo: titolo,
      anno: anno,
      annoEdizione: annoEdizione,
      venditore: userData.id,
      date: date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear(),
      dateMillis: date.getMilliseconds()
    }


    setDb(refDb(database, 'venditalibro/' + createUUID()), data);
    window.alert("FATTO");

    titoloField.value = null;
    materiaField.value = null;
    isbnField.value = null;
    prezzoField.value = null;
    annoEdizioneField.value = null;
  };


  // BUY BOOK FORM
  var bookBuyForm = document.getElementById('bookBuyForm');
  bookBuyForm.onsubmit = function(e) {
    e.preventDefault();
    var date = new Date();

    var titoloField = document.getElementById("buyBookTitolo");
    var materiaField = document.getElementById("buyBookMateria");
    var isbnField = document.getElementById("buyBookISBN");
    var annoField = document.getElementById("buyBookAnno");
    var annoEdizioneField = document.getElementById("buyBookAnnoEdizione");

    var titolo = titoloField.value;
    var materia = materiaField.value;
    var isbn = isbnField.value;
    var anno = parseInt(annoField.value);
    var annoEdizione = Math.max(0, Math.min(date.getYear(), parseInt(annoEdizioneField.value)));

    if (("" +isbn).length !== 13) {
      window.alert("L'ISBN deve essere di 13 cifre");
      return false;
    }

    var data = {
      titolo: titolo,
      materia: materia,
      isbn: isbn,
      anno: anno,
      annoEdizione: annoEdizione,
      acquirente: userData.id,
      date: date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear(),
      dateMillis: date.getMilliseconds()
    }

    setDb(refDb(database, 'richiestalibro/' + createUUID()), data);
    window.alert("FATTO");

    titoloField.value = null;
    materiaField.value = null;
    isbnField.value = null;
    annoEdizioneField.value = null;
  };


  // SELL REP FORM
  var sellRepForm = document.getElementById('repSellForm');
  sellRepForm.onsubmit = function(e) {
    e.preventDefault();

    var classeField = document.getElementById("sellRepClasse");
    var istitutoField = document.getElementById("sellRepIstituto");
    var descrizioneField = document.getElementById("sellRepDesc");
    var prezzoField = document.getElementById("sellRepPrezzo");
    var contrattabileField = document.getElementById("sellRepContrattabile");

    var classe = parseInt(classeField.value);
    var istituto = istitutoField.value;
    var descrizione = descrizioneField.value;
    var prezzo = prezzoField.value;
    var contrattabile = contrattabileField.value;

    var date = new Date();
    var data = {
      classe: classe,
      istituto: istituto,
      prezzo: prezzo,
      contrattabile: contrattabile,
      venditore: venditore,
      nomeCognome: userData.nome + " " + userData.cognome,
      date: date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear(),
      dateMillis: date.getMilliseconds()
    }

    if (descrizione !== null)
      data.descrizione = descrizione;

    var subs = {};
    for(let i = 1; i <= currSellRepSubsNum; i++){
      var sellRepSubField = document.getElementById('sellRepSub' + i);
      var sub = sellRepSubField.value;
      subs[sub] = "";
    }
    data.subs = subs;

    setDb(refDb(database, 'venditalezione/' + createUUID()), data);
    window.alert("FATTO");
    
    prezzoField.value = null;
    descrizioneField.value = null;
    var sellRepSubsDiv = document.getElementById('sellRepSubs');
    sellRepSubsDiv.innerHTML = "<div class=\"col-md-10 offset-md-1\"><input id=\"sellRepSub1\" class=\"form-control\" type=\"text\" style=\"margin-left:0px;font-family:Roboto, sans-serif;\" name=\"materia\" required></div>";
    currSellRepSubsNum = 1;
  };


  // BUY REP FORM
  var buyRepForm = document.getElementById('repBuyForm');
  buyRepForm.onsubmit = function(e) {
    e.preventDefault();

    var argomentoField = document.getElementById("buyRepArgomento");

    var argomento = argomentoField.value;

    var date = new Date();
    var data = {
      argomento: argomento,
      acquirente: userData.id,
      date: date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear(),
      dateMillis: date.getMilliseconds()
    }

    var subs = {};
    for(let i = 1; i <= currBuyRepSubsNum; i++){
      var buyRepSubField = document.getElementById('buyRepSub' + i);
      var sub = buyRepSubField.value;
      if(sub !== null)
        subs[sub] = "";
    }
    data.subs = subs;

    setDb(refDb(database, 'richiestalezione/' + createUUID()), data);
    window.alert("FATTO");
    
    var buyRepSubsDiv = document.getElementById('buyRepSubs');
    buyRepSubsDiv.innerHTML = "<div class=\"col-md-10 offset-md-1\"><input id=\"buyRepSub1\" class=\"form-control\" type=\"text\" style=\"margin-left:0px;font-family:Roboto, sans-serif;\" name=\"materia\" required></div>";
    currBuyRepSubsNum = 1;
  };

  // DOWNLOAD ANNUNCI VENDITA LIBRI
  var sellBookAdsContainer = document.getElementById("bookSellAdsContainer");
  var bookSellAdsCount = 0;
  getDb(query(refDb(database, 'venditalibro'), orderByChild('dateMillis'), limitToLast(15))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (bookSellAdsCount % 3 === 0) { // new row
        ind++;
        sellBookAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"bookSellAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("bookSellAdsContainerRow" + ind).innerHTML += getBookSellDiv(ad);

      var card = document.getElementById("bookSellAd" + ad.id);
      card.addEventListener('click', function() {
        document.getElementById("bookSellAdSection").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookBuyAdSection").hidden = true;
        document.getElementById("repSellAdSection").hidden = true;
        document.getElementById("repBuyAdSection").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }
        getDb(refDb(database, 'users/' + ad.acquirente)).then((snap) => {
          fillBookSellAdSection(data, snap.val());
        });
      });


      bookSellAdsCount++;
    }
  });

  // DOWNLOAD ANNUNCI RICHIESTA LIBRI
  var buyBookAdsContainer = document.getElementById("bookBuyAdsContainer");
  var bookBuyAdsCount = 0;
  getDb(query(refDb(database, 'richiestalibro'), orderByChild('dateMillis'), limitToLast(15))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (bookBuyAdsCount % 3 === 0) { // new row
        ind++;
        buyBookAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"bookBuyAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("bookBuyAdsContainerRow" + ind).innerHTML += getBookBuyDiv(ad);

      var card = document.getElementById("bookBuyAd" + ad.id);
      card.addEventListener('click', function() {
        document.getElementById("bookBuyAdSection").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookSellAdSection").hidden = true;
        document.getElementById("repSellAdSection").hidden = true;
        document.getElementById("repBuyAdSection").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        getDb(refDb(database, 'users/' + ad.acquirente)).then((snap) => {
          fillBookBuyAdSection(data, snap.val());
        });
      });

      bookBuyAdsCount++;
    }
  });

  // DOWNLOAD ANNUNCI VENDITA LEZIONI
  var sellRepAdsContainer = document.getElementById("repSellAdsContainer");
  var repSellAdsCount = 0;
  getDb(query(refDb(database, 'venditalezione'), orderByChild('dateMillis'), limitToLast(15))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (repSellAdsCount % 3 === 0) { // new row
        ind++;
        sellRepAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"sellRepAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("sellRepAdsContainerRow" + ind).innerHTML += getRepSellDiv(ad);

      var card = document.getElementById("repSellAd" + ad.id);
      card.addEventListener('click', function() {
        document.getElementById("repSellAdSection").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookBuyAdSection").hidden = true;
        document.getElementById("bookSellAdSection").hidden = true;
        document.getElementById("repBuyAdSection").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        getDb(refDb(database, 'users/' + ad.acquirente)).then((snap) => {
          fillRepSellAdSection(data, snap.val());
        });
      });

      repSellAdsCount++;
    }
  });

  // DOWNLOAD ANNUNCI RICHIESTA LEZIONI
  var buyRepAdsContainer = document.getElementById("repBuyAdsContainer");
  var repBuyAdsCount = 0;
  getDb(query(refDb(database, 'richiestalezione'), orderByChild('dateMillis'), limitToLast(15))).then((snap) => {
    if(snap.val() === null)
      return;

    let vals = snap.val();
    var ads = [];
    for (let val in vals) {
      var ad = vals[val];
      ads.push({
        ad: ad,
        id: val
      });
    }
    ads.reverse();

    var ind = -1;
    for (let val in ads) {
      var ad = ads[val];

      if (repBuyAdsCount % 3 === 0) { // new row
        ind++;
        buyRepAdsContainer.innerHTML += "<div class=\"row space-rows\" id=\"repBuyAdsContainerRow" + ind + "\"></div>";
      }
      // add view
      document.getElementById("repBuyAdsContainerRow" + ind).innerHTML += getRepBuyDiv(ad);

      var card = document.getElementById("repBuyAd" + ad.id);
      card.addEventListener('click', function() {
        document.getElementById("repBuyAdSection").hidden = false;
        document.getElementById("homebtnNav").hidden = false;
        document.getElementById("loginbtnNav").hidden = true;
        document.getElementById("createAccountSection").hidden = true;
        document.getElementById("logincreateSection").hidden = true;
        document.getElementById("contentAnnunci").hidden = true;
        document.getElementById("contentCrea").hidden = true;
        document.getElementById("navbtn1").hidden = true;
        document.getElementById("navbtn2").hidden = true;
        document.getElementById("navbtn3").hidden = true;
        document.getElementById("navbtn4").hidden = true;
        document.getElementById("bookBuyAdSection").hidden = true;
        document.getElementById("repSellAdSection").hidden = true;
        document.getElementById("bookSellAdSection").hidden = true;

        if (userData.id === null) {
          document.getElementById("loginbtnNav").hidden = false;
          document.getElementById("profilobtnNav").hidden = true;
        }
        else {
          document.getElementById("loginbtnNav").hidden = true;
          document.getElementById("profilobtnNav").hidden = false;
        }

        getDb(refDb(database, 'users/' + ad.acquirente)).then((snap) => {
          fillRepBuyAdSection(data, snap.val());
        });
      });

      repBuyAdsCount++;
    }
  });
}, false);
// **************************************************** ONLOAD

// startAt, endAt to query with rtdb: matematica è restituito da startAt("matematica".substring(0, n));

/* send mails con googleAppScript
function mandaMail(destinatario, oggetto, testo) {
  MailApp.sendMail({
    to: destinatario,
    subject: oggetto,
    htmlBody: testo
  });
}

function doGet(e) {
  var pars = e.parameters;
  mandaMail(pars.dest.toString(), pars.oggetto.toString(), pars.testo.toString());
  return ContentService.createTexrtOutput().setMimeType(ContentService.MimeType.JAVASCRIPT);
}

$.ajax(crossDomain:true, url:"url dello script&testo=dqoijdqw", method:"GET", DataType:"jsonp");
*/

/*
onValue(query(refDatabase(database, 'utenti/'), orderByChild('cognome'), equalTo("allora")), (snapshot) => {
    console.log(snapshot.val());
})
*/


/*
var datatable=$('#data-table').DataTable({
  "order": [],
  "columnDefs": [ {
    "targets": [0,1,2,3,4,5,6],
    "orderable": false
    } ],
    "language": {
      "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Italian.json"
    },
    "pageLength": 50,
  data: [],
  //CHANGE THE TABLE HEADINGS BELOW TO MATCH WITH YOUR SELECTED DATA RANGE
  columns: [
    {"title":"Stato"},
    {"title":"Tipologia richiesta"},
    {"title":"Dettagli richiesta"},
    {"title":"Inoltrata il"},
    {"title":"id"},
    {"title":"Ritira"},
    {"title":"Protocollo Medico"},
    {"title":"Ann.segr."}
  ]
});
onAuthStateChanged(auth,user=>{
  if(user != null){
    $('#pagina').removeClass('d-none');
    $('#message').addClass('d-none');
    if(!ePresenteInAmministratori(user.email)){//INIZIO se l'utente non è amministratore
      onValue(query(refDatabase(database, 'docenti/'), orderByChild('mail'), equalTo(user.email)), (snapshot) => {
        for(var i in snapshot.val()){
          $('#sottotitolo').html("relative a "+snapshot.val()[i].nome+" "+snapshot.val()[i].cognome);
        }
      }, {onlyOnce: true});
      onValue(query(refDatabase(database, 'richieste_docenti/'), orderByChild('mail'), equalTo(user.email)), (snapshot) => {
        var dati_ricevuti = snapshot.val();
          var dataArray=[];
          for(var k in dati_ricevuti){
            var elemento=dati_ricevuti[k];
            if(elemento.stato=="") elemento.stato="INOLTRATA";
            if(elemento.id=="") elemento.id=k;
            var riga=[];
            var html="<button class='btn ";
            switch (elemento.stato) {
              case 'ACCETTATA': html+="btn-success";break;
              case 'INOLTRATA': html+="btn-warning";break;
              case 'RIFIUTATA': html+="btn-danger";break;
              case 'RITIRATA': html+="btn-info";break;
              default: html+="btn-secondary";
            }
            html+=" stato' disabled>";
            html+=elemento.stato;
            html+="</button>";
            riga.push(html);
            html="<button class='btn tipologia_richiesta ";
            html+=elemento.tipologia_richiesta.toString().toLowerCase();
            html+="' disabled><strong>";
            html+=elemento.tipologia_richiesta.toString().toUpperCase();
            html+="</strong></button>";
            riga.push(html);
            html="<span class='btn btn-light dettagli'>";
            switch (elemento.tipologia_richiesta.toString().toUpperCase()) {
              case "PERMESSO BREVE":
                var giorno=new Date(elemento.pb_giorno.toString());
                var g=new Date(elemento.pb_da_ore.toString());
                var milliseconds = Date.parse(g);
                milliseconds = milliseconds - 3000000;  //=50 * 60 * 1000 50 minuti
                var g1 = new Date(milliseconds);
                g=new Date(elemento.pb_a_ore.toString());
                var milliseconds = Date.parse(g);
                milliseconds = milliseconds - 3000000;  //=50 * 60 * 1000
                var g2 = new Date(milliseconds);
                var da_ore=g1.toLocaleTimeString('it-IT', {hour:"2-digit",minute:"2-digit"});
                var a_ore=g2.toLocaleTimeString('it-IT', {hour:"2-digit",minute:"2-digit"});
                html+="<strong>"+giorno.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> dalle <strong>"+da_ore+"</strong> alle <strong>"+a_ore+"</strong>";
                break;
              case "PERMESSO":
                var da_data=new Date(elemento.p_da_giorno.toString());
                var a_data=new Date(elemento.p_a_giorno.toString());
                html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.p_gg_complessivi+"</strong>gg]<br><small>"+elemento.p_motivazione+"</small>";
                break;
              case "FERIE":
                var da_data=new Date(elemento.f_da_giorno.toString());
                var a_data=new Date(elemento.f_a_giorno.toString());
                html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.f_gg_complessivi+"</strong>gg]<br><small>"+elemento.f_tipologia+"</small>";
                break;
              case "MALATTIA":
                var da_data=new Date(elemento.m_da_giorno.toString());
                var a_data=new Date(elemento.m_a_giorno.toString());
                html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.m_gg_complessivi+"</strong>gg]";
                break;
              case "ASPETTATIVA":
                var da_data=new Date(elemento.as_da_giorno.toString());
                var a_data=new Date(elemento.as_a_giorno.toString());
                html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.as_gg_complessivi+"</strong>gg]";
                break;
              case "ALTRO":
                var da_data=new Date(elemento.al_da_giorno.toString());
                var a_data=new Date(elemento.al_a_giorno.toString());
                html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.al_gg_complessivi+"</strong>gg]<br><small>"+elemento.al_motivazione+"</small>";
                break;
            }
            html+="</span>";
            riga.push(html);
            var data=new Date(elemento.timestamp.toString());
            //var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}; day:"2-digit"
            riga.push("<button class='btn btn-light timestamp'>"+data.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'})+" "+data.toLocaleTimeString('it-IT', {hour:"2-digit",minute:"2-digit"})+"</button>");
            riga.push("<button class='btn btn-light'>"+elemento.id+"</button>");
            html="<button class='btn btn-danger ritira'";
            if(elemento.stato!="INOLTRATA") html+=" disabled";
            html+="  id='"+k+"'>R</button>";
            riga.push(html);
            if(elemento.tipologia_richiesta.toString().toUpperCase()=='MALATTIA'){
              if(elemento.protocollo_medico==""){
                html="<button class='btn btn-success protocollo_medico' title='Carica protocollo medico' id='"+k+"'>Carica</button>";
              }
              else{
                html="<button class='btn btn-light protocollo_medico' disabled>"+elemento.protocollo_medico+"</span>";
              }
              riga.push(html);
            }
            else{
              riga.push("");
            }
            if(elemento.annotazioni_segreteria==""){
              html="";
            }
            else{
              html="<button class='btn btn-light annotazioni' disabled><small>"+elemento.annotazioni_segreteria+"</small></span>";
            }
            riga.push(html);
            dataArray.push(riga);
          }
          datatable.clear().rows.add(dataArray).order([4,'desc']).draw();
          $('.protocollo_medico').click(function () {
            var dato=$(this).attr('id').toString();
            var dettagli_richiesta=$(this).parent().parent().children().eq(2).children().eq(0).html();
            var id_richiesta=$(this).parent().parent().children().eq(4).children().eq(0).html();
            $('#modal_title').html("Carica protocollo medico");
            $('#modal_body').html("Dettagli: id <strong>"+id_richiesta+"</strong><br>"+dettagli_richiesta+"<br>Protocollo:<br><input type='text' class='w-100' id='nr_protocollo'>");
            $('#modal_footer').html("<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Annulla</button> <button type='button' class='btn btn-danger comando_protocollo' data-bs-dismiss='modal' id='"+dato+"'>Carica</button>");
            $('.comando_protocollo').click(function () {
              var dato=$(this).attr('id').toString();
              var updates={};
              updates['/richieste_docenti/'+dato+'/protocollo_medico'] = $('#nr_protocollo').val();
              update(refDatabase(database), updates);
            });
            $('#modalRichieste').modal('show');
          });
          $('.ritira').click(function () {
            var dato=$(this).attr('id').toString();
            var tipologia_richiesta=$(this).parent().parent().children().eq(1).children().eq(0).html();
            var dettagli_richiesta=$(this).parent().parent().children().eq(2).children().eq(0).html();
            var id_richiesta=$(this).parent().parent().children().eq(4).children().eq(0).html();
            $('#modal_title').html("Ritira la richiesta di "+tipologia_richiesta);
            $('#modal_body').html("Dettagli: id <strong>"+id_richiesta+"</strong><br>"+dettagli_richiesta);
            $('#modal_footer').html("<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Annulla</button> <button type='button' class='btn btn-danger comando_ritira' data-bs-dismiss='modal' id='"+dato+"'>Ritira</button>");
            $('.comando_ritira').click(function () {
              var dato=$(this).attr('id').toString();
              var updates={};
              updates['/richieste_docenti/'+dato+'/stato'] = "RITIRATA";
              update(refDatabase(database), updates);
            });
            $('#modalRichieste').modal('show');
            //console.log(dati[0]+" "+dati[1]);
          });}, {onlyOnce: false});
      }//FINE se l'utente non è amministratore
      else{//INIZIO se l'utente è il dirigente o il protocollo o un responsabile di plesso
        $(datatable.column(2).header()).text('Docente');
        $(datatable.column(3).header()).text('I');
        $(datatable.column(4).header()).text('Dettagli richiesta');
        $(datatable.column(5).header()).text('Inoltrata il');
        $(datatable.column(6).header()).text('id');
        $('#sottotitolo').html("relative a tutti i docenti");
        //caricamento dei nomi e delle mail di tutti i docenti
        var docenti={};
        onValue(query(refDatabase(database, 'docenti/')), (snapshot) => {
          for(var i in snapshot.val()){
            docenti[snapshot.val()[i].mail]={nome:snapshot.val()[i].nome,cognome:snapshot.val()[i].cognome};
          }
          onValue(query(refDatabase(database, 'richieste_docenti/')), (snapshot) => {
            var dati_ricevuti = snapshot.val();
              var dataArray=[];
              for(var k in dati_ricevuti){
                var elemento=dati_ricevuti[k];
                if(elemento.stato=="") elemento.stato="INOLTRATA";
                if(elemento.id=="") elemento.id=k;
                var riga=[];
                var html="<button class='btn ";
                switch (elemento.stato) {
                  case 'ACCETTATA': html+="btn-success";break;
                  case 'INOLTRATA': html+="btn-warning";break;
                  case 'RIFIUTATA': html+="btn-danger";break;
                  case 'RITIRATA': html+="btn-info";break;
                  default: html+="btn-secondary";
                }
                html+=" stato'";
                if(elemento.stato!="INOLTRATA" || user.email!=DIRIGENTE ){
                  html+=" disabled";
                }
                else{
                  html+=" id='"+k+"' ";
                }
                html+=" >";
                html+=elemento.stato;
                html+="</button>";
                riga.push(html);
                html="<button class='btn tipologia_richiesta ";
                html+=elemento.tipologia_richiesta.toString().toLowerCase();
                html+="' disabled><strong>";
                html+=elemento.tipologia_richiesta.toString().toUpperCase();
                html+="</strong></button>";
                riga.push(html);
                html="<span class='btn btn-light docente'><strong>";
                var strNomeCompletoDocente=docenti[elemento.mail.toString()].cognome+" "+docenti[elemento.mail.toString()].nome;
                html+=strNomeCompletoDocente.toUpperCase();
                html+="</strong></button>";
                riga.push(html);
                html="<span class='btn btn-light tip'>";
                html+=(elemento.tipologia_contratto=='Indeterminato')?'TI':'TD';
                html+="<br><small style='font-size:10px;'>"+elemento.plessi+"</small>";
                html+="</span>";
                riga.push(html);
                html="<span class='btn btn-light dettagli'>";
                switch (elemento.tipologia_richiesta.toString().toUpperCase()) {
                  case "PERMESSO BREVE":
                    var giorno=new Date(elemento.pb_giorno.toString());
                    var g=new Date(elemento.pb_da_ore.toString());
                    var milliseconds = Date.parse(g);
                    milliseconds = milliseconds - 3000000;  //=50 * 60 * 1000 50 minuti
                    var g1 = new Date(milliseconds);
                    g=new Date(elemento.pb_a_ore.toString());
                    var milliseconds = Date.parse(g);
                    milliseconds = milliseconds - 3000000;  //=50 * 60 * 1000
                    var g2 = new Date(milliseconds);
                    var da_ore=g1.toLocaleTimeString('it-IT', {hour:"2-digit",minute:"2-digit"});
                    var a_ore=g2.toLocaleTimeString('it-IT', {hour:"2-digit",minute:"2-digit"});
                    html+="<strong>"+giorno.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> dalle <strong>"+da_ore+"</strong> alle <strong>"+a_ore+"</strong>";
                    break;
                  case "PERMESSO":
                    var da_data=new Date(elemento.p_da_giorno.toString());
                    var a_data=new Date(elemento.p_a_giorno.toString());
                    html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.p_gg_complessivi+"</strong>gg]<br><small>"+elemento.p_motivazione+"</small>";
                    break;
                  case "FERIE":
                    var da_data=new Date(elemento.f_da_giorno.toString());
                    var a_data=new Date(elemento.f_a_giorno.toString());
                    html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.f_gg_complessivi+"</strong>gg]<br><small>"+elemento.f_tipologia+"</small>";
                    break;
                  case "MALATTIA":
                    var da_data=new Date(elemento.m_da_giorno.toString());
                    var a_data=new Date(elemento.m_a_giorno.toString());
                    html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.m_gg_complessivi+"</strong>gg]";
                    if(elemento.protocollo_medico!=""){
                      html+="<br><small>Prot.medico: "+elemento.protocollo_medico+"</small>";
                    }
                    break;
                  case "ASPETTATIVA":
                    var da_data=new Date(elemento.as_da_giorno.toString());
                    var a_data=new Date(elemento.as_a_giorno.toString());
                    html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.as_gg_complessivi+"</strong>gg]";
                    break;
                  case "ALTRO":
                    var da_data=new Date(elemento.al_da_giorno.toString());
                    var a_data=new Date(elemento.al_a_giorno.toString());
                    html+="da <strong>"+da_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> a <strong>"+a_data.toLocaleDateString('it-IT', {weekday:'short',year: 'numeric', month: 'short', day: 'numeric'})+"</strong> [<strong>"+elemento.al_gg_complessivi+"</strong>gg]<br><small>"+elemento.al_motivazione+"</small>";
                    break;
                }
                html+="</span>";
                riga.push(html);
                var data=new Date(elemento.timestamp.toString());
                //var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}; day:"2-digit"
                riga.push("<button class='btn btn-light timestamp'>"+data.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'})+" "+data.toLocaleTimeString('it-IT', {hour:"2-digit",minute:"2-digit"})+"</button>");
                riga.push("<button class='btn btn-light'>"+elemento.id+"</button>");
                html="<button ";
                if(user.email!=DIRIGENTE && user.email!=PROTOCOLLO){
                  html+="disabled ";
                }
                if(elemento.annotazioni_segreteria==""){
                  html+="class='btn btn-light annotazioni' title='Annotazioni' id='"+k+"'>Annota</button>";
                }
                else{
                  html+="class='btn btn-light annotazioni' title='Annotazioni' id='"+k+"'>"+elemento.annotazioni_segreteria+"</button>";
                }
                riga.push(html);
                dataArray.push(riga);
              }

              datatable.clear().rows.add(dataArray).order([6,'desc']).draw();
              $('.stato').click(function () {
                var dato=$(this).attr('id').toString();
                var tipologia_richiesta=$(this).parent().parent().children().eq(1).children().eq(0).html();
                var tipologia_mail=$(this).parent().parent().children().eq(1).children().eq(0).children().eq(0).html();
                var stato=$(this).html();
                var docente=$(this).parent().parent().children().eq(2).children().eq(0).html();
                var docente_mail=$(this).parent().parent().children().eq(2).children().eq(0).children().eq(0).html();
                var dettagli=$(this).parent().parent().children().eq(4).children().eq(0).html();
                var id=$(this).parent().parent().children().eq(6).children().eq(0).html();
                var plessi1=$(this).parent().parent().children().eq(3).children().eq(0).children(0).eq(1).html();
                $('#modal_title').html("Richiesta di "+tipologia_richiesta);
                $('#modal_body').html("Richiesta [id:<strong>"+id+"</strong>] di "+tipologia_richiesta+"<br>Docente: "+docente+"<br>Dettagli: "+dettagli);
                $('#modal_footer').html("<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Annulla</button> <button type='button' class='btn btn-danger comando_rifiuta' data-bs-dismiss='modal' id='"+dato+"'>Rifiuta</button> <button type='button' class='btn btn-success comando_accetta' data-bs-dismiss='modal' id='"+dato+"'>Accetta</button>");
                $('.comando_accetta').click(function(){
                  var dato=$(this).attr('id').toString();
                    var updates={};
                    updates['/richieste_docenti/'+dato+'/stato'] = "ACCETTATA";
                    update(refDatabase(database), updates);
                    var plessi2=plessi1.split(', ');
                    var coll_mail="";
                    for (var i = 0; i < plessi2.length; i++) {
                      if(plessi2[i]=="IPSIA"){
                        for (var j = 0; j < RESPONSABILI_IPSIA.length; j++) {
                          coll_mail+=RESPONSABILI_IPSIA[j]+"_";
                        }
                        continue;
                      }
                      if(plessi2[i]=="ITIS"){
                        for (var j = 0; j < RESPONSABILI_ITIS.length; j++) {
                          coll_mail+=RESPONSABILI_ITIS[j]+"_";
                        }
                        continue;
                      }
                      if(plessi2[i]=="LICEO"){
                        for (var j = 0; j < RESPONSABILI_LICEO.length; j++) {
                          coll_mail+=RESPONSABILI_LICEO[j]+"_";
                        }
                      }
                    }
                    coll_mail+=PROTOCOLLO;
                    $.ajax({
                      crossDomain: true,
                      url: URL_WEBAPP+"?cosa=accettata&coll_mail="+coll_mail+"&id="+id+"&docente="+docente_mail+"&dettagli="+dettagli+"&tipologia="+tipologia_mail,
                      method: "GET",
                      dataType: "jsonp"
                    });
                });
                $('.comando_rifiuta').click(function(){
                  var dato=$(this).attr('id').toString();
                    var updates={};
                    updates['/richieste_docenti/'+dato+'/stato'] = "RIFIUTATA";
                    update(refDatabase(database), updates);
                    console.log(URL_WEBAPP+"?cosa=rifiutata&id="+id+"&docente="+docente_mail+"&dettagli="+dettagli+"&tipologia="+tipologia_mail);
                    $.ajax({
                      crossDomain: true,
                      url: URL_WEBAPP+"?cosa=rifiutata&coll_mail=niente&id="+id+"&docente="+docente_mail+"&dettagli="+dettagli+"&tipologia="+tipologia_mail,
                      method: "GET",
                      dataType: "jsonp"
                    });
                });
                $('#modalRichieste').modal('show');
              });
              $('.annotazioni').click(function () {
                var dato=$(this).attr('id').toString();
                var tipologia_richiesta=$(this).parent().parent().children().eq(1).children().eq(0).html();
                var docente_richiesta=$(this).parent().parent().children().eq(2).children().eq(0).html();
                var dettagli_richiesta=$(this).parent().parent().children().eq(4).children().eq(0).html();
                var id_richiesta=$(this).parent().parent().children().eq(6).children().eq(0).html();
                var annotazioni=$(this).parent().parent().children().eq(7).children().eq(0).html();
                $('#modal_title').html("Annota richiesta di "+tipologia_richiesta);
                $('#modal_body').html("Docente: "+docente_richiesta+"<br>Dettagli: id <strong>"+id_richiesta+"</strong><br>"+dettagli_richiesta+"<br>Annotazione:<br><textarea class='w-100' id='annot'>"+annotazioni+"</textarea>");
                $('#modal_footer').html("<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Annulla</button> <button type='button' class='btn btn-success comando_annotazione' data-bs-dismiss='modal' id='"+dato+"'>Annota</button>");
                $('.comando_annotazione').click(function () {
                  var dato=$(this).attr('id').toString();
                  var updates={};
                  updates['/richieste_docenti/'+dato+'/annotazioni_segreteria'] = $('#annot').val();
                  update(refDatabase(database), updates);
                });
                $('#modalRichieste').modal('show');
              });
            }, {onlyOnce: false});
        }, {onlyOnce: true});
      } //FINE se l'utente è il dirigente o il protocollo
  }
  else{
    $('#pagina').addClass('d-none');
    $('#message').removeClass('d-none');
    $('#overlay').addClass('d-none');
  }
});
$('#btnLogout').click(function(){
  signOut(auth).then(() => {
    $('#pagina').addClass('d-none');
    $('#message').removeClass('d-none');
  }).catch((error) => {});
});
document.getElementById("btnLogin").addEventListener('click', function(){
  //$('#overlay').removeClass('d-none');
  signInWithRedirect(auth, provider);

});
function ePresenteInAmministratori(mail) {
  if(mail==DIRIGENTE){return true;}
  else if(mail==PROTOCOLLO){return true;}
  for(var i=0;i<RESPONSABILI_IPSIA.length;i++){
    if(mail==RESPONSABILI_IPSIA[i]) return true;
  }
  for(var i=0;i<RESPONSABILI_ITIS.length;i++){
    if(mail==RESPONSABILI_ITIS[i]) return true;
  }
  for(var i=0;i<RESPONSABILI_LICEO.length;i++){
    if(mail==RESPONSABILI_LICEO[i]) return true;
  }
  return false;
}
*/
