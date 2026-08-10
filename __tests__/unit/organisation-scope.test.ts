import {
  getOrganisationScope,
  buildOrganisationFilter,
  applyOrganisationFilter,
} from "@/lib/organisation-scope"

const USER_ID = "user-1"
const ORG_ID = "org-1"

interface FakeOptions {
  user?: { id: string } | null
  organisation?: { id: string; type: string } | null
  organisationError?: { message: string } | null
  managedOwners?: Array<{
    id: string
    nom: string
    user_id: string | null
    commission_pct: number | null
  }>
  managedOwnersError?: { message: string } | null
}

function buildSupabase(options: FakeOptions = {}) {
  const {
    user = { id: USER_ID },
    organisation = null,
    organisationError = null,
    managedOwners = [],
    managedOwnersError = null,
  } = options

  const from = jest.fn((table: string) => {
    if (table === "organisations") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: organisation,
              error: organisationError,
            }),
          }),
        }),
      }
    }

    return {
      select: () => ({
        eq: async () => ({
          data: managedOwners,
          error: managedOwnersError,
        }),
      }),
    }
  })

  return {
    auth: { getUser: async () => ({ data: { user } }) },
    from,
  } as any
}

describe("getOrganisationScope", () => {
  it("throws when there is no authenticated user", async () => {
    await expect(getOrganisationScope(buildSupabase({ user: null }))).rejects.toThrow(
      "User not authenticated"
    )
  })

  it("falls back to an individual scope when the user has no organisation", async () => {
    await expect(getOrganisationScope(buildSupabase())).resolves.toEqual({
      organisationId: null,
      organisationType: "individuel",
      proprietaireIds: [USER_ID],
      proprietairesGeres: [],
    })
  })

  it("propagates an organisation lookup failure", async () => {
    await expect(
      getOrganisationScope(
        buildSupabase({ organisationError: { message: "rls denied" } })
      )
    ).rejects.toThrow("Failed to fetch organisation: rls denied")
  })

  it("does not query managed owners for an individual organisation", async () => {
    const supabase = buildSupabase({
      organisation: { id: ORG_ID, type: "individuel" },
    })

    await expect(getOrganisationScope(supabase)).resolves.toEqual({
      organisationId: ORG_ID,
      organisationType: "individuel",
      proprietaireIds: [USER_ID],
      proprietairesGeres: [],
    })
    expect(supabase.from).toHaveBeenCalledTimes(1)
  })

  it("defaults an empty organisation type to individuel", async () => {
    const scope = await getOrganisationScope(
      buildSupabase({ organisation: { id: ORG_ID, type: "" } })
    )

    expect(scope.organisationType).toBe("individuel")
  })

  it("returns managed owners and their user ids for a gestionnaire", async () => {
    const scope = await getOrganisationScope(
      buildSupabase({
        organisation: { id: ORG_ID, type: "gestionnaire" },
        managedOwners: [
          { id: "pg-1", nom: "Awa", user_id: "user-2", commission_pct: 15 },
          { id: "pg-2", nom: "Koffi", user_id: null, commission_pct: null },
        ],
      })
    )

    expect(scope).toEqual({
      organisationId: ORG_ID,
      organisationType: "gestionnaire",
      proprietaireIds: [USER_ID, "user-2"],
      proprietairesGeres: [
        { id: "pg-1", nom: "Awa", userId: "user-2", commissionPct: 15 },
        { id: "pg-2", nom: "Koffi", userId: null, commissionPct: 10 },
      ],
    })
  })

  it("deduplicates owner ids", async () => {
    const scope = await getOrganisationScope(
      buildSupabase({
        organisation: { id: ORG_ID, type: "agence" },
        managedOwners: [
          { id: "pg-1", nom: "Awa", user_id: USER_ID, commission_pct: 10 },
          { id: "pg-2", nom: "Awa bis", user_id: "user-2", commission_pct: 10 },
          { id: "pg-3", nom: "Awa ter", user_id: "user-2", commission_pct: 10 },
        ],
      })
    )

    expect(scope.proprietaireIds).toEqual([USER_ID, "user-2"])
  })

  it("propagates a managed owners lookup failure", async () => {
    await expect(
      getOrganisationScope(
        buildSupabase({
          organisation: { id: ORG_ID, type: "agence" },
          managedOwnersError: { message: "timeout" },
        })
      )
    ).rejects.toThrow("Failed to fetch managed owners: timeout")
  })
})

describe("buildOrganisationFilter", () => {
  it("keeps only the fields needed by callers", () => {
    expect(
      buildOrganisationFilter({
        organisationId: ORG_ID,
        organisationType: "agence",
        proprietaireIds: [USER_ID],
        proprietairesGeres: [],
      })
    ).toEqual({ organisationId: ORG_ID, proprietaireIds: [USER_ID] })
  })
})

describe("applyOrganisationFilter", () => {
  const buildQuery = () => {
    const query: any = {
      eq: jest.fn(() => query),
      in: jest.fn(() => query),
    }
    return query
  }

  it.each(["immeubles", "locataires"])(
    "filters %s by organisation_id when the org exists",
    async (table) => {
      const query = buildQuery()

      await applyOrganisationFilter(
        buildSupabase({ organisation: { id: ORG_ID, type: "individuel" } }),
        query,
        table
      )

      expect(query.eq).toHaveBeenCalledWith("organisation_id", ORG_ID)
      expect(query.in).not.toHaveBeenCalled()
    }
  )

  it.each(["immeubles", "locataires"])(
    "falls back to proprietaire_id for %s without an organisation",
    async (table) => {
      const query = buildQuery()

      await applyOrganisationFilter(buildSupabase(), query, table)

      expect(query.in).toHaveBeenCalledWith("proprietaire_id", [USER_ID])
      expect(query.eq).not.toHaveBeenCalled()
    }
  )

  it.each(["logements", "contrats", "paiements", "unknown_table"])(
    "leaves %s untouched (filtering is done by the caller)",
    async (table) => {
      const query = buildQuery()

      await expect(
        applyOrganisationFilter(buildSupabase(), query, table)
      ).resolves.toBe(query)
      expect(query.eq).not.toHaveBeenCalled()
      expect(query.in).not.toHaveBeenCalled()
    }
  )
})
