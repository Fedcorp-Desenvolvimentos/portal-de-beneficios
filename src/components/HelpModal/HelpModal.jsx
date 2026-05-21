// import React from 'react';
// import { FaTimes, FaLightbulb } from 'react-icons/fa';
// import * as S from '../PageTemplate/PageTemplateStyles';

// const HelpModal = ({ isOpen, onClose, content }) => {
//   if (!isOpen) return null;

//   // Se o conteúdo for uma string, renderiza como parágrafo
//   const renderContent = () => {
//     if (typeof content === 'string') {
//       return <p>{content}</p>;
//     }
//     return content;
//   };

//   return (
//     <S.ModalOverlay onClick={onClose}>
//       <S.ModalContent onClick={(e) => e.stopPropagation()}>
//         <S.ModalHeader>
//           <S.ModalTitleWrapper>
//             <FaLightbulb size={18} />
//             <S.ModalTitle>Guia Rápido</S.ModalTitle>
//           </S.ModalTitleWrapper>
//           <S.ModalClose onClick={onClose}>
//             <FaTimes />
//           </S.ModalClose>
//         </S.ModalHeader>
//         <S.ModalBody>
//           {renderContent()}
//         </S.ModalBody>
//         <S.ModalFooter>
//           <S.ModalButton onClick={onClose}>Entendi</S.ModalButton>
//         </S.ModalFooter>
//       </S.ModalContent>
//     </S.ModalOverlay>
//   );
// };

// export default HelpModal;