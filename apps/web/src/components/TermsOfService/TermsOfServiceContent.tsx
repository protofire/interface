import { Link } from "react-router-dom";
import { useCloseModal } from "state/application/hooks";
import { ApplicationModal } from "state/application/reducer";
import styled from "styled-components";

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

export function TermsOfServiceContent() {
  const closeModal = useCloseModal();
  const close = () => {
    localStorage.setItem("accepted_terms", "true");
    closeModal(ApplicationModal.TERMS_OF_SERVICE);
  };

  return (
    <StyledContainer>
      <StyledDisclaimerTitle>Important Notice</StyledDisclaimerTitle>
      <StyledParagraph>
        By accessing or using this open-source Uniswap interface (“Interface”),
        you agree that you have read, understand and accept all of the terms,
        conditions and disclaimers set forth herein. If you do not agree to all
        of these terms, conditions and disclaimers, do not use the Interface.
      </StyledParagraph>
      <Separator />
      <StyledParagraph>
        You can read the full acknowledgment here:{" "}
        <StyledLink to={"/swap"}>Terms of Service</StyledLink>
      </StyledParagraph>
      <StyledCloseButton onClick={close}>Agreed</StyledCloseButton>
      {/* <p>General</p>

      <p>
        The Interface provides a means of access to the Uniswap V3 Protocol (the
        “Protocol”) on Zora Network (the “Network”). The Protocol is a set of
        open-source or source-available self-executing smart contracts initially
        deployed by Universal Navigation Inc. (“Uniswap Labs”). The Interface is
        distinct from the Protocol and functions as merely one means of
        accessing the Protocol. For more information about the distinction
        between the Protocol and Uniswap Interfaces, please see Uniswap’s Terms
        of Service.{" "}
      </p>

      <p>
        This Interface is completely open source, with the full repository
        available at [INSERT]. This version of the Interface has been modified
        for compatibility with Zora Network and made available to you solely for
        your convenience - USE IT AT YOUR OWN RISK. Neither Zora Labs, Inc.
        (“Zora Labs”) nor any other third party manages or maintains the
        Interface. Third-party developers may contribute to updating or
        upgrading the Interface but are under no obligation to do so.
      </p>

      <p>
        By using the Interface, you represent that that you are at least the age
        of majority in your jurisdiction, and that you are not (a) the subject
        of economic or trade sanctions administered or enforced by any
        governmental authority or otherwise designated on any list of prohibited
        or restricted parties (including but not limited to the list maintained
        by the Office of Foreign Assets Control of the U.S. Department of the
        Treasury) or (b) a citizen, resident, or organized in a jurisdiction or
        territory that is the subject of comprehensive country-wide,
        territory-wide, or regional economic sanctions issued by the United
        States. Finally, you represent that your access and use of the Interface
        will fully comply with all applicable laws and regulations, and that you
        will not access or use the Interface to conduct, promote, or otherwise
        facilitate any illegal activity.
      </p>

      <p>
        To access the Interface, you must use non-custodial wallet software,
        which allows you to interact with public blockchains. Your relationship
        with your non-custodial wallet software provider is governed by the
        provider’s applicable terms of service. Neither the Interface, nor any
        developer or contributor to the Interface, has custody or control over
        the contents of your wallet or the ability to retrieve or transfer its
        contents.
      </p>

      <p>Disclaimers</p>

      <p>By using the Interface, you acknowledge and agree as follows:</p>

      <p>
        INDEPENDENT LEGAL, FINANCIAL OR OTHER PROFESSIONAL ADVICE - Nothing in
        the Interface or Protocol or otherwise provided by developers or
        contributors to the Interface, is intended to be legal, financial or
        other professional advice. Please consider consulting a lawyer,
        financial advisor or similar professional advisor before proceeding, as
        use of the Interface may implicate legal, financial, tax, regulatory,
        and other considerations. By proceeding, you confirm that you have
        either received independent legal, financial or other professional
        advice on these issue, or that you understand the potential risks and
        have consciously chosen not to obtain such advice. OPEN SOURCE AND THIRD
        PARTY SOFTWARE - The Interface is fully open source, and such software
        is made available to you under the terms of the applicable licenses.
        Please review the applicable licenses for the Interface here.
      </p>
      <p>
        NO WARRANTY - By interacting with the Interface and the Protocol, you
        acknowledge that the Interface and Protocol are provided on an “as is”
        and “as available” basis without warranties of any kind, and that the
        Interface and Protocol may not meet your requirements, may not be
        current or error-free, and that errors or defects may not be corrected.
        LIMITATION OF LIABILITY - In no event shall developers or contributors
        to the Interface or the Protocol, including Zora Labs, be liable to you
        or any related party for any indirect, special, incidental,
        consequential, exemplary, punitive, or other damages of any kind,
        including damages for business interruption, loss of use, data breach,
        revenue or profit, cost of capital, loss of business opportunity, loss
        of goodwill, or federal, state, or other regulatory liability,
        regardless of whether such damages were foreseeable and whether or not
        any party was advised of the possibility of such damages.{" "}
      </p>
      <p>ASSUMPTION OF RISK </p>
      <p>
        By accessing the Interface, you represent that you are financially and
        technically sophisticated enough to understand the inherent risks
        associated with using cryptographic and blockchain-based systems, and
        that you have a working knowledge of the usage and intricacies of
        digital assets such as ether (ETH), so-called stablecoins, and other
        digital tokens such as those following an ethereum token standard (e.g.,
        ERC-20).{" "}
      </p>
      <p>
        You acknowledge that while the Interface is intended to serve as a
        convenient way to access the Protocol, the Interface and Protocol
        incorporate experimental and novel technology and the use of such
        technology involves a high degree of risk. For example, there are
        numerous reasons the Interface and/or Protocol could fail in an
        unexpected way, resulting in the total and absolute loss of your assets.
        You understand and agree that you assume all risks in connection with
        your use of the Interface and Protocol, and expressly waive and release
        all developers and contributors to the Interface and Protocol, including
        Zora Labs, from any and all liability, claims, causes of actions or
        damages arising out of or in any way relating to your use of the
        Interface and Protocol.
      </p>

      <p>
        You understand that users of the Protocol are free to make available any
        type of supported token trading pair via the Protocol. Like a web
        browser that enables the user to access and interact with any website
        made available on the world wide web, the Interface enables the user to
        easily search for token trading pairs available on the Protocol and
        effect transactions through the Protocol using a non-custodial wallet.
        No developer or contributor to the Interface or Protocol, including Zora
        Labs, approves or vets the tokens made available via the Protocol. You
        acknowledge and agree that no developer or contributor to the Interface
        or Protocol, including Zora Labs, shall be liable to you for any losses
        resulting from tokens that you purchase or sell through the Interface or
        Protocol. Please exercise caution when purchasing and selling tokens
        through the Interface and confirm the mint contract address for each
        token that you intend to buy or sell.
      </p>
      <p>
        In particular, you understand that the markets for these digital assets
        are nascent and highly volatile due to risk factors including, but not
        limited to, adoption, speculation, technology, security, and regulation.
        you understand that anyone can create a token, including fake versions
        of existing tokens and tokens that falsely claim to represent projects,
        and acknowledge and accept the risk that you may mistakenly trade those
        or other tokens. Please be aware that Zora Network does not have a
        native token and Zora Labs has not endorsed or approved any third party
        tokens purporting to be associated with Zora or Zora Network. Exercise
        caution with respect to any tokens that use Zora imagery or branding.
        So-called stablecoins may not be as stable as they purport to be, may
        not be fully or adequately collateralized, and may be subject to panics
        and runs, which may cause the price of any such stablecoins to deviate
        from, and become valued less than, the price of its pegged assets;
        otherwise known as “depegged”.
      </p>
      <p>
        Further, you understand that smart contract transactions automatically
        execute and settle, and that blockchain-based transactions are
        irreversible when confirmed. You acknowledge and accept that the cost
        and speed of transacting with cryptographic and blockchain-based systems
        such as Ethereum are variable and may increase dramatically at any time.
        You further acknowledge and accept the risk of selecting to trade in
        expert modes, which can expose you to potentially significant price
        slippage and higher costs.
      </p>
      <p>
        Additionally, smart contracts can take information as an input, process
        that information through the rules defined in the computer code and
        execute certain actions, such as digital asset transactions, that have
        been programmed into the smart contract. The use of smart contracts
        creates risk exposure because smart contracts use experimental
        cryptography. The occurrence of software bugs or other flaws cannot be
        ruled out and may potentially result in the theft or destruction of
        funds. As a result, you understand such smart contract related-risks are
        associated with using the Interface and Protocol.
      </p>
      <p>
        You also understand that hackers, cyber criminals or other similar
        nefarious actors may attempt to attack, destroy or otherwise compromise
        the integrity and security of the Interface or Protocol. You acknowledge
        and accept that such malicious activity remains a significant risk when
        using blockchain-based systems, such as Ethereum and the Protocol, and
        that use of the Interface or Protocol exposes you to such risk.{" "}
      </p>
      <p>
        The Ethereum blockchain may experience backlogs, higher than normal
        transaction fees, changes to the network, failures, downtime or even a
        fork of the network. You understand that the Protocol may be subject to
        such events and that the developers or contributors to the Interface,
        including Zora Labs, are not responsible for the operation of Ethereum
        and makes no guarantees regarding the blockchain’s security,
        functionality or availability.{" "}
      </p>

      <p>
        In summary, you acknowledge that the developers or contributors to the
        Interface, including Zora Labs, are not responsible for any of these
        variables or risks, do not own or control the Interface or Protocol, and
        cannot be held liable for any resulting losses that you experience while
        accessing or using any of the Interface or Protocol. Accordingly, you
        understand and agree to assume full responsibility for all of the risks
        of accessing and using the Interface to interact with the Protocol.
      </p> */}
    </StyledContainer>
  );
}
