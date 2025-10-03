// app/dashboard/overview/page.tsx
import PageContainer from "@/components/layout/page-container";
import OverviewClient from "@/features/overview/overview-client";

export default function OverviewPage() {
   return (
      <PageContainer scrollable useContainer>
         <OverviewClient initial={null} />
      </PageContainer>
   );
}
