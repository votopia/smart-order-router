import { V3Route } from "../../../../router";
import { CandidatePoolsBySelectionCriteria } from "../../../functions/get-candidate-pools";

export interface GetRoutesResult<Route extends V3Route> {
  routes: Route[];
  candidatePools: CandidatePoolsBySelectionCriteria;
}
