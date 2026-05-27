import { BranchesManager } from "@/components/dashboard/BranchesManager"
import { getBranches } from "./actions"

export default async function BranchesPage() {
  const branches = await getBranches()

  return <BranchesManager initialBranches={branches} />
}
