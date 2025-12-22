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
    if (isSameAddress(address, '0xf1815bd50389c46847f0bda824ec8da914045d14')) {
      return 'https://assets.swap.w3us.site/assets/USDC.png'
    }
    // USDF
    if (isSameAddress(address, '0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED')) {
      return 'https://assets.swap.w3us.site/assets/USDCf.png'
    }
    // WBTC
    if (isSameAddress(address, '0x717dae2baf7656be9a9b01dee31d571a9d4c9579')) {
      return 'https://assets.swap.w3us.site/assets/WBTC.png'
    }
    // PYUSD0
    if (isSameAddress(address, '0x99aF3EeA856556646C98c8B9b2548Fe815240750')) {
      return 'https://assets.swap.w3us.site/assets/PYUSD0.svg'
    }
  }

  if (networkName) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}
