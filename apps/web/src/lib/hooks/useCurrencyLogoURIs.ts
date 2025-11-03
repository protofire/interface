import EthereumLogo from 'assets/images/ethereum-logo.png'
import AnimeLogo from 'assets/png/anime-logo.png'
import FlowLogo from 'assets/png/flow-logo.png'
import AvaxLogo from 'assets/svg/avax_logo.svg'
import BnbLogo from 'assets/svg/bnb-logo.svg'
import CeloLogo from 'assets/svg/celo_logo.svg'
import MaticLogo from 'assets/svg/matic-token-icon.svg'
import { getChain, isSupportedChainId } from 'constants/chains'
import { PORTAL_ETH_CELO, isCelo, nativeOnChain } from 'constants/tokens'
import { InterfaceChainId, UniverseChainId } from 'uniswap/src/types/chains'
import { isSameAddress } from 'utilities/src/addresses'

export function getNativeLogoURI(chainId: InterfaceChainId = UniverseChainId.Mainnet): string {
  switch (chainId) {
    case UniverseChainId.Polygon:
    case UniverseChainId.PolygonMumbai:
      return MaticLogo
    case UniverseChainId.Bnb:
      return BnbLogo
    case UniverseChainId.Celo:
    case UniverseChainId.CeloAlfajores:
      return CeloLogo
    case UniverseChainId.Avalanche:
      return AvaxLogo
    case UniverseChainId.Anime:
      return AnimeLogo
    case UniverseChainId.FlowTestnet:
    case UniverseChainId.FlowMainnet:
      return FlowLogo
    case UniverseChainId.BaseSepolia:
      return EthereumLogo // Base uses ETH as native
    default:
      return EthereumLogo
  }
}

export function getTokenLogoURI(address: string, chainId: InterfaceChainId = UniverseChainId.Mainnet): string | void {
  const networkName = isSupportedChainId(chainId) ? getChain({ chainId }).assetRepoNetworkName : undefined

  if (isCelo(chainId) && isSameAddress(address, nativeOnChain(chainId).wrapped.address)) {
    return CeloLogo
  }
  if (isCelo(chainId) && isSameAddress(address, PORTAL_ETH_CELO.address)) {
    return EthereumLogo
  }

  // Flow Testnet specific tokens
  if (chainId === UniverseChainId.FlowTestnet) {
    // WFLOW
    if (isSameAddress(address, '0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e')) {
      return FlowLogo
    }
    // USDC
    if (isSameAddress(address, '0x5e65b6B04fbA51D95409712978Cb91E99d93aE73')) {
      return 'https://raw.githubusercontent.com/onflow/assets/main/tokens/registry/0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED/logo.png'
    }
  }

  // Flow Mainnet specific tokens
  if (chainId === UniverseChainId.FlowMainnet) {
    // WFLOW
    if (isSameAddress(address, '0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e')) {
      return FlowLogo
    }
    // USDC
    if (isSameAddress(address, '0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED')) {
      return 'https://raw.githubusercontent.com/onflow/assets/main/tokens/registry/0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED/logo.png'
    }
  }

  // Base Sepolia specific tokens
  if (chainId === UniverseChainId.BaseSepolia) {
    // WETH
    if (isSameAddress(address, '0x4200000000000000000000000000000000000006')) {
      return EthereumLogo
    }
    // USDC
    if (isSameAddress(address, '0x036CbD53842c5426634e7929541eC2318f3dCF7e')) {
      return 'https://raw.githubusercontent.com/onflow/assets/main/tokens/registry/0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED/logo.png'
    }
  }

  if (networkName) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}
