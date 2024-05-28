import styled from "styled-components";
import { ApplicationModal } from "state/application/reducer";
import { useOpenModal } from "state/application/hooks";

export function TermsOfServiceButton({ label }: { label: string }) {
  const openModal = useOpenModal(ApplicationModal.TERMS_OF_SERVICE);

  const StyledButton = styled.button`
    display: inline;
    padding: 0;
    border: none;
    background: none;
    text-align: left;
    font-size: 16px;
    text-decoration: none;
    color: ${({ theme }) => theme.neutral2};
    &:hover {
      color: ${({ theme }) => theme.accent1};
      opacity: 1;
      cursor: pointer;
    }
  `;

  return <StyledButton onClick={openModal}>{label}</StyledButton>;
}
