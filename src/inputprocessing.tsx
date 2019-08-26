import {
  makeBech32Display,
  makeBip39MnemonicDisplay,
  makeBnsAccountDisplay,
  makeBnsUsernameDisplay,
  makeEd25519HdWalletDisplay,
  makeEd25519PrivkeyDisplay,
  makeEd25519PubkeyDisplay,
  makeEthereumAddressDisplay,
  makeHexDisplay,
  makeLiskAccountDisplay,
  makeLiskLikePassphraseDisplay,
  makeRiseAccountDisplay,
  makeSecp256k1HdWalletDisplay,
  makeSimpleAddressDisplay,
  makeWeaveAddressDisplay,
} from "./displays";
import { InputProperties, interprete } from "./interprete";
import {
  accountBasedSlip10HdCoins,
  iovTestnets,
  liskNetworks,
  riseNetworks,
  secp256k1Slip10HdCoins,
} from "./settings";

export interface StaticDisplay {
  readonly id: string;
  readonly priority: number;
  readonly deprecated?: boolean;
  readonly interpretedAs: string;
  readonly data: JSX.Element;
}

export interface InteractiveDisplay {
  readonly id: string;
  readonly priority: number;
  readonly deprecated?: boolean;
  readonly interpretedAs: string;
  readonly getData: () => Promise<any>;
  readonly renderData: (data: any) => StaticDisplay;
}

export type Display = StaticDisplay | InteractiveDisplay;

export function isInteractiveDisplay(display: Display): display is InteractiveDisplay {
  return (
    typeof (display as InteractiveDisplay).getData === "function" &&
    typeof (display as InteractiveDisplay).renderData === "function"
  );
}

export async function processInput(input: string): Promise<readonly Display[]> {
  const normalizedInput = input.trim();

  const properties = interprete(normalizedInput);

  const out = new Array<Display>();

  if (properties.has(InputProperties.IovAddressTestnet)) {
    for (const network of iovTestnets) {
      out.push(makeBnsAccountDisplay(normalizedInput, network));
    }
  }

  if (properties.has(InputProperties.BnsUsername)) {
    for (const network of iovTestnets.filter(testnet => !!testnet.bnsUsernameSupported)) {
      out.push(makeBnsUsernameDisplay(normalizedInput, network));
    }
  }

  if (properties.has(InputProperties.EnglishMnemonic)) {
    out.push(makeBip39MnemonicDisplay(normalizedInput));

    for (const hdCoin of accountBasedSlip10HdCoins) {
      out.push(await makeEd25519HdWalletDisplay(normalizedInput, hdCoin));
    }
    for (const hdCoin of secp256k1Slip10HdCoins) {
      out.push(await makeSecp256k1HdWalletDisplay(normalizedInput, hdCoin));
    }
    out.push(await makeSimpleAddressDisplay(normalizedInput));

    if (properties.has(InputProperties.EnglishMnemonic12Words)) {
      out.push(await makeLiskLikePassphraseDisplay(normalizedInput));
    }
  }

  if (properties.has(InputProperties.Bech32)) {
    out.push(makeBech32Display(normalizedInput));
  }

  if (properties.has(InputProperties.Hex)) {
    if (properties.has(InputProperties.ByteLength20)) {
      out.push(makeWeaveAddressDisplay(normalizedInput));
    }
    if (properties.has(InputProperties.ByteLength32)) {
      out.push(makeEd25519PubkeyDisplay(normalizedInput));
    }
    if (properties.has(InputProperties.ByteLength64)) {
      out.push(makeEd25519PrivkeyDisplay(normalizedInput));
    }
    out.push(makeHexDisplay(normalizedInput));
  }

  if (properties.has(InputProperties.LiskAddress)) {
    for (const network of liskNetworks) {
      out.push(makeLiskAccountDisplay(normalizedInput, network));
    }
  }

  if (properties.has(InputProperties.RiseAddress)) {
    for (const network of riseNetworks) {
      out.push(makeRiseAccountDisplay(normalizedInput, network));
    }
  }

  if (properties.has(InputProperties.EthereumAddress)) {
    out.push(makeEthereumAddressDisplay(normalizedInput));
  }

  out.sort((a, b) => a.priority - b.priority);

  return out;
}
