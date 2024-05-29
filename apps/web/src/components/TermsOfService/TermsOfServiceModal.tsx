import Modal from "components/Modal";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ApplicationModal } from "state/application/reducer";
import { useModalIsOpen, useCloseModal } from "state/application/hooks";

const StyledContainer = styled.div`
  padding: 20px;
`;

const StyledDisclaimerTitle = styled.h3`
  text-align: center;
  font-weight: normal;
  font-size: 1.4em;
`;

const StyledParagraph = styled.p`
  font-size: 1.1em;
  &:last-child {
    margin-bottom: 15px;
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.accent1};
`;

const StyledCloseButton = styled.button`
  display: block;
  padding: 10px;
  margin: 0 auto;
  border: none;
  border-radius: 16px;
  background: ${({ theme }) => theme.accent1};
  color: ${({ theme }) => theme.white};
  font-weight: 700;
  font-size: 1.1em;
  &:hover {
    cursor: pointer;
  }
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.surface3};
`;

export function TermsOfServiceModal() {
  const isOpen = useModalIsOpen(ApplicationModal.TERMS_OF_SERVICE);
  const closeModal = useCloseModal();

  const close = () => {
    localStorage.setItem("accepted_terms", "true");
    closeModal(ApplicationModal.TERMS_OF_SERVICE);
  };

  return (
    <Modal isOpen={isOpen} onDismiss={() => {}} maxWidth={680}>
      <StyledContainer>
        <StyledDisclaimerTitle>Important Notice</StyledDisclaimerTitle>
        <StyledParagraph>
          By accessing or using this open-source Uniswap interface
          (“Interface”), you agree that you have read, understand and accept all
          of the terms, conditions and disclaimers set forth herein. If you do
          not agree to all of these terms, conditions and disclaimers, do not
          use the Interface.
        </StyledParagraph>
        <Separator />
        <StyledParagraph>
          You can read the full acknowledgment here:{" "}
          <StyledLink to={"/terms-of-service"}>Terms of Service</StyledLink>
        </StyledParagraph>
        <StyledCloseButton onClick={close}>Agreed</StyledCloseButton>
      </StyledContainer>
    </Modal>
  );
}
