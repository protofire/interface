import Modal from "components/Modal";
import { ApplicationModal } from "state/application/reducer";
import { useModalIsOpen } from "state/application/hooks";
import { TermsOfServiceContent } from "./TermsOfServiceContent";

export function TermsOfServiceModal() {
  const isOpen = useModalIsOpen(ApplicationModal.TERMS_OF_SERVICE);

  return (
    <Modal isOpen={isOpen} onDismiss={() => {}} maxWidth={680}>
      <TermsOfServiceContent />
    </Modal>
  );
}
