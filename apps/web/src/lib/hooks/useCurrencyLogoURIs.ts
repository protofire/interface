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
      return StableLogo
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
  if (isSameAddress(address, '0x78Cf24370174180738C5B8E352B6D14c83a6c9A9')) {
    return 'https://assets.swap.w3us.site/assets/USDT.png'
  }

  if (networkName) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }
}
