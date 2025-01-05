import { V3SubgraphPool } from "./v3/subgraph-provider";
/**
 * Gets subgraph pools from a URI. The URI shoudl contain a JSON
 * stringified array of V2SubgraphPool objects or V3SubgraphPool
 * objects.
 *
 * @export
 * @class URISubgraphProvider
 * @template TSubgraphPool
 */
export declare class URISubgraphProvider<TSubgraphPool extends V3SubgraphPool> {
    private uri;
    private timeout;
    private retries;
    constructor(uri: string, timeout?: number, retries?: number);
    getPools(): Promise<TSubgraphPool[]>;
}
