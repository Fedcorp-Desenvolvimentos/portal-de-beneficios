// import React from 'react'

// export default function ConfirmarDesativacaoModal({
//   isOpen,
//   title = 'Confirmar alteração',
//   message = 'Tem certeza que deseja alterar o status?',
//   onConfirm,
//   onClose,
// }) {
//   if (!isOpen) return null

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2>{title}</h2>
//         <p>{message}</p>

//         <div className="form-actions">
//           <button type="button" className="btn-secondary" onClick={onClose}>
//             Cancelar
//           </button>

//           <button type="button" className="btn-primary" onClick={onConfirm}>
//             Confirmar
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }