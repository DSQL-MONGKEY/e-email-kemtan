import PageContainer from "@/components/layout/page-container";
import MastersManager from "@/features/masters/masters-manager";

export default function MastersPage() {
   return (
      <PageContainer scrollable={true} useContainer={true}>
         <MastersManager />
      </PageContainer>
   );
}
