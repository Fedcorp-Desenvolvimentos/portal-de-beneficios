// import React, { useEffect, useState } from 'react'

// const initialForm = {
//   nomeFantasia: '',
//   razaoSocial: '',
//   cnpj: '',
//   email: '',
//   telefone: '',
//   status: 'ativa',
// }

// export default function AdministradoraModal({
//   isOpen,
//   administradora,
//   onClose,
//   onSave,
// }) {
//   const [form, setForm] = useState(initialForm)

//   useEffect(() => {
//     if (administradora) {
//       setForm(administradora)
//     } else {
//       setForm(initialForm)
//     }
//   }, [administradora, isOpen])

//   if (!isOpen) return null

//   function handleChange(event) {
//     const { name, value } = event.target

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   function handleSubmit(event) {
//     event.preventDefault()
//     onSave(form)
//   }

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content modal-large">
//         <h2>{administradora ? 'Editar Administradora' : 'Nova Administradora'}</h2>

//         <form onSubmit={handleSubmit}>
//           <div className="form-grid">
//             <label>
//               Nome Fantasia
//               <input name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} required />
//             </label>

//             <label>
//               Razão Social
//               <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} required />
//             </label>

//             <label>
//               CNPJ
//               <input name="cnpj" value={form.cnpj} onChange={handleChange} required />
//             </label>

//             <label>
//               Email
//               <input type="email" name="email" value={form.email} onChange={handleChange} required />
//             </label>

//             <label>
//               Telefone
//               <input name="telefone" value={form.telefone} onChange={handleChange} />
//             </label>

//             <label>
//               Status
//               <select name="status" value={form.status} onChange={handleChange}>
//                 <option value="ativa">Ativa</option>
//                 <option value="inativa">Inativa</option>
//               </select>
//             </label>
//           </div>

//           <div className="form-actions">
//             <button type="button" className="btn-secondary" onClick={onClose}>
//               Cancelar
//             </button>

//             <button type="submit" className="btn-primary">
//               Salvar
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }