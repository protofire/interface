import EthereumLogo from 'assets/images/ethereum-logo.png'
import AnimeLogo from 'assets/png/anime-logo.png'
import AvaxLogo from 'assets/svg/avax_logo.svg'
import BnbLogo from 'assets/svg/bnb-logo.svg'
import CeloLogo from 'assets/svg/celo_logo.svg'
import MaticLogo from 'assets/svg/matic-token-icon.svg'
import StableLogo from 'assets/png/gusdt-logo.png'
import { getChain, isSupportedChainId } from 'constants/chains'
import { PORTAL_ETH_CELO, isCelo, nativeOnChain } from 'constants/tokens'
import { InterfaceChainId, UniverseChainId } from 'uniswap/src/types/chains'
import { isSameAddress } from 'utilities/src/addresses'
import { USDT0_STABLE, USDT0_STABLE_TESTNET } from 'uniswap/src/constants/tokens'

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
    case UniverseChainId.StableTestnet:
    case UniverseChainId.Stable:
      return StableLogo
    default:
      return EthereumLogo
  }
}

export function getTokenLogoURI(address: string, chainId: InterfaceChainId = UniverseChainId.Mainnet): string | void {
  const networkName = isSupportedChainId(chainId) ? getChain({ chainId }).assetRepoNetworkName : undefined

  if (chainId === 988) console.log('tokenURI', address, chainId, networkName)

  if (isCelo(chainId) && isSameAddress(address, nativeOnChain(chainId).wrapped.address)) {
    return CeloLogo
  }
  if (isCelo(chainId) && isSameAddress(address, PORTAL_ETH_CELO.address)) {
    return EthereumLogo
  }
  if (isSameAddress(address, USDT0_STABLE_TESTNET.address)) {
    return 'https://assets.swap.w3us.site/assets/USDT0.png'
  }

  if (isSameAddress(address, USDT0_STABLE.address)) {
    return 'https://assets.swap.w3us.site/assets/USDT0.png'
  }

  if (networkName) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}
