console.log("hi", firebase);
//references
const signInBtn = document.querySelector(".signIn");
const signOutBtn = document.querySelector(".signOut");
const userDetailsContainer = document.querySelector("#userDetailsContainer");
const itemsEl = document.querySelector("#items");
const createItemsBtn = document.querySelector("#createItems");

// part 1:auth
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.addEventListener("click", () => auth.signInWithPopup(provider));
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
	if (user) {
		alert("login has happened...");
		userDetailsContainer.innerHTML = `
		<h5>This person is logged in:</h5>
		<img src=${user.photoURL} alt="no image">
		<h5>Name: ${user.displayName}</h5>
		<h5>E-mail: ${user.email}</h5>
		`;
		signInBtn.disabled = true;
		signOutBtn.disabled = false;
		console.log("logged in", user);
	} else {
		alert("logout has happened...");
		console.log("logged out");
		userDetailsContainer.innerHTML = `you are logged out`;
		signInBtn.disabled = false;
		signOutBtn.disabled = true;
	}
});

// part 2:firestore

const db = firebase.firestore();
const { serverTimestamp } = firebase.firestore.FieldValue;

let thingsRef;
let unsubscribe;

auth.onAuthStateChanged(user => {
	if (user) {
		thingsRef = db.collection("vegetables");
		// only change database
		createItemsBtn.onclick = () => {
			thingsRef.add({
				uid: user.uid,
				createdAt: serverTimestamp(),
				vegetable: faker.random.word(),
			});
		};

		// change UI also
		unsubscribe = thingsRef
			.where("uid", "==", user.uid) //query
			.orderBy("createdAt") //compound query: change multiple operations together on same query
			.onSnapshot(querySnapShot => {
				itemsEl.textContent = querySnapShot.docs.map(doc => doc.data().vegetable).join(", ");
			});
	}
});
