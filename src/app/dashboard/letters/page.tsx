import PageContainer from "@/components/layout/page-container";
import LettersTable from "@/features/letter/letter-table";

type SP = Record<string, string | string[] | undefined>;

const asString = (v: string | string[] | undefined, def = "") =>
   Array.isArray(v) ? (v[0] ?? def) : (v ?? def);

const asPositiveInt = (v: string | string[] | undefined, def: number) => {
   const s = asString(v);
   const n = parseInt(s || "", 10);
   return Number.isFinite(n) && n > 0 ? n : def;
};

function hasThen(p: unknown): p is { then: unknown } {
   return typeof (p as { then?: unknown }).then === "function";
}

export default async function LettersPage({
   searchParams,
}: { searchParams: Promise<SP> | SP }) {
   const sp = hasThen(searchParams) ? await (searchParams as Promise<SP>) : (searchParams as SP);

   const initial = {
      q: asString(sp.q),
      category: asString(sp.category),
      division: asString(sp.division),
      from: asString(sp.from),
      to: asString(sp.to),
      page: asPositiveInt(sp.page, 1),
      limit: asPositiveInt(sp.limit, 10),
   };

   return (
      <PageContainer scrollable useContainer>
         <LettersTable initialParams={initial} />
      </PageContainer>
   );
}
