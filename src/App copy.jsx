// // src/App.jsx
// import { useState, useEffect } from 'react';
// import { useAuth } from './context/AuthContext';
// import AppRouter from "./routes/AppRouter";
// import FirstAccessModal from "./components/FirstAccessModal/FirstAccessModal";

// function App() {
//   const { user, logout } = useAuth();
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     if (user && user.primeiro_acesso === true) {
//       setShowModal(true);
//     }
//   }, [user]);

//   const handleSuccess = async () => {
//     setShowModal(false);
//     await logout();
//   };

//   const handleClose = () => {
//     setShowModal(false);
//   };

//   return (
//     <>
//       <AppRouter />
//       {showModal && user && (
//         <FirstAccessModal
//           isOpen={showModal}
//           onClose={handleClose}
//           onSuccess={handleSuccess}
//           user={user}
//         />
//       )}
//     </>
//   );
// }

// export default App;