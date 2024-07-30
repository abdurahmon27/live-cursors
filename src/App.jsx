import React, { useEffect, useState, useRef } from "react";
import { db, auth, signInAnonymously, onAuthStateChanged } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import Cursor from "./assets/cursor.png";

const App = () => {
  const [cursors, setCursors] = useState([]);
  const [userId, setUserId] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    const signInUser = async () => {
      await signInAnonymously(auth);
    };

    const authListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        const handleMouseMove = async (e) => {
          const { clientX, clientY } = e;
          const cursorRef = doc(db, "cursors", user.uid);
          await setDoc(cursorRef, { x: clientX, y: clientY, timestamp: serverTimestamp() }, { merge: true });

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(async () => {
            await deleteDoc(cursorRef);
          }, 3000);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      } else {
        signInUser();
      }
    });

    return () => authListener();
  }, []);

  useEffect(() => {
    const cursorsRef = collection(db, "cursors");
    const unsubscribe = onSnapshot(cursorsRef, (snapshot) => {
      const cursorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCursors(cursorsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cleanUpStaleCursors = async () => {
      const cursorsRef = collection(db, "cursors");
      const now = Date.now();
      const cutoff = now - 3000;
      const staleCursorsQuery = query(
        cursorsRef,
        where("timestamp", "<", new Date(cutoff))
      );
      const staleCursorDocs = await getDocs(staleCursorsQuery);

      staleCursorDocs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    };

    const interval = setInterval(cleanUpStaleCursors, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen min-h-screen">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className={`absolute w-5 h-5 bg-no-repeat ${userId === cursor.id ? "hidden" : "block"}`}
          style={{
            left: cursor.x,
            top: cursor.y,
            backgroundImage: `url(${Cursor})`,
            backgroundSize: "contain",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
};

export default App;
