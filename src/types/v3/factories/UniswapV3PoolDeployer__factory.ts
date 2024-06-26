/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UniswapV3PoolDeployer,
  UniswapV3PoolDeployerInterface,
} from "../UniswapV3PoolDeployer";

const _abi = [
  {
    inputs: [],
    name: "parameters",
    outputs: [
      {
        internalType: "address",
        name: "factory",
        type: "address",
      },
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060f78061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80638903573014602d575b600080fd5b60336082565b6040805173ffffffffffffffffffffffffffffffffffffffff96871681529486166020860152929094168383015262ffffff16606083015260029290920b608082015290519081900360a00190f35b6000546001546002805473ffffffffffffffffffffffffffffffffffffffff938416939283169281169162ffffff7401000000000000000000000000000000000000000083041691770100000000000000000000000000000000000000000000009004900b8556fea164736f6c6343000706000a";

export class UniswapV3PoolDeployer__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<UniswapV3PoolDeployer> {
    return super.deploy(overrides || {}) as Promise<UniswapV3PoolDeployer>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): UniswapV3PoolDeployer {
    return super.attach(address) as UniswapV3PoolDeployer;
  }
  connect(signer: Signer): UniswapV3PoolDeployer__factory {
    return super.connect(signer) as UniswapV3PoolDeployer__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniswapV3PoolDeployerInterface {
    return new utils.Interface(_abi) as UniswapV3PoolDeployerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UniswapV3PoolDeployer {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UniswapV3PoolDeployer;
  }
}
